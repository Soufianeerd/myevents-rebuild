import { sql } from 'drizzle-orm';
import { z } from 'zod';
import type { AuthenticationProvider } from '../contracts/auth/AuthenticationProvider';
import type { ScopedDatabase } from './database';
import type { UserId, TenantId } from '@/core/ids';
import { validatePasswordPolicy } from '@/core/auth/utils/PasswordPolicy';
import { createAppError } from '@/core/errors';
import { ok, err } from '@/core/result';

type Reply = { data: unknown; error: unknown };
export interface NeonAuthApi {
  session(): Promise<Reply>;
  login(input: { email: string; password: string }): Promise<Reply>;
  register(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<Reply>;
  logout(): Promise<Reply>;
  requestReset(input: { email: string; redirectTo: string }): Promise<Reply>;
  reset(input: { token: string; newPassword: string }): Promise<Reply>;
  verify(input: { email: string; otp: string }): Promise<Reply>;
  resend(input: { email: string }): Promise<Reply>;
}
export const neonSessionSchema = z
  .object({
    user: z.object({
      id: z.uuid(),
      email: z.email(),
      emailVerified: z.literal(true),
    }),
    session: z.object({ id: z.uuid(), userId: z.uuid() }).refine((s) => !!s.id),
  })
  .refine((s) => s.user.id === s.session.userId);
const profileSchema = z.object({
  id: z.uuid(),
  tenant_id: z.uuid(),
  email: z.email(),
  first_name: z.string(),
  last_name: z.string(),
});
const invalid = () =>
  err(
    createAppError(
      'UNAUTHORIZED',
      'Adresse e-mail ou mot de passe incorrect.',
      401,
    ),
  );

export class NeonAuthenticationProvider implements AuthenticationProvider {
  readonly confirmationMethod = 'code' as const;
  constructor(
    private api: NeonAuthApi,
    private database: (
      session: z.infer<typeof neonSessionSchema> | null,
    ) => ScopedDatabase,
    private appUrl: string,
  ) {}
  async currentIdentity() {
    const result = await this.api.session();
    if (result.error) return null;
    const session = neonSessionSchema.safeParse(result.data);
    if (!session.success) return null;
    const rows = await this.database(session.data).query(
      sql`SELECT * FROM myevents.ensure_identity()`,
    );
    if (!rows[0]) return null;
    const p = profileSchema.parse(rows[0]);
    return {
      tenantId: p.tenant_id as TenantId,
      user: {
        id: p.id as UserId,
        firstName: p.first_name,
        lastName: p.last_name,
        displayName: `${p.first_name} ${p.last_name}`.trim(),
        email: p.email,
      },
    };
  }
  async login(email: string, password: string) {
    const result = await this.api.login({ email, password });
    if (result.error) {
      const code = z.object({ code: z.string() }).safeParse(result.error);
      if (code.success && code.data.code === 'EMAIL_NOT_VERIFIED')
        return err(
          createAppError(
            'UNAUTHORIZED',
            'Confirmez votre adresse e-mail avant de vous connecter.',
            { confirmationRequired: true },
          ),
        );
      return invalid();
    }
    try {
      return (await this.currentIdentity()) ? ok(undefined) : invalid();
    } catch {
      return err(
        createAppError(
          'FORBIDDEN',
          'Votre compte est reconnu, mais votre espace est indisponible. Si vous reprenez un ancien compte, son rattachement doit être finalisé.',
        ),
      );
    }
  }
  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const policy = validatePasswordPolicy(input.password);
    if (!policy.ok) return err(policy.error);
    const result = await this.api.register({
      email: input.email,
      password: input.password,
      name: `${input.firstName} ${input.lastName}`.trim(),
    });
    const data = z
      .object({ user: z.object({ id: z.uuid(), emailVerified: z.boolean() }) })
      .safeParse(result.data);
    if (result.error || !data.success)
      return err(
        createAppError(
          'VALIDATION_ERROR',
          'Impossible de créer ce compte. Vérifiez les informations ou réessayez plus tard.',
        ),
      );
    await this.database(null).query(
      sql`SELECT myevents.save_registration_names(${data.data.user.id}::uuid,${input.firstName},${input.lastName})`,
    );
    // The managed service sends the verification OTP at sign-up.
    return ok({ confirmationRequired: !data.data.user.emailVerified });
  }
  async logout() {
    if ((await this.api.logout()).error)
      throw new Error('Unable to sign out. Please retry.');
  }
  async requestReset(email: string) {
    // Same public response for known/unknown addresses and rate limits.
    await this.api.requestReset({
      email,
      redirectTo: `${this.appUrl}/reinitialiser-mot-de-passe`,
    });
  }
  async reset(token: string, password: string) {
    const policy = validatePasswordPolicy(password);
    if (!policy.ok) return err(policy.error);
    const result = await this.api.reset({ token, newPassword: password });
    if (result.error)
      return err(
        createAppError(
          'VALIDATION_ERROR',
          'Ce lien de réinitialisation est invalide ou a expiré.',
          400,
        ),
      );
    // SQL authorization also rejects sessions older than the new credential.
    await this.logout();
    return ok(undefined);
  }
  async verifyEmail(email: string, code: string) {
    const result = await this.api.verify({ email, otp: code });
    return result.error
      ? err(
          createAppError(
            'VALIDATION_ERROR',
            'Ce code est invalide ou a expiré.',
          ),
        )
      : ok(undefined);
  }
  async resendConfirmation(email: string) {
    await this.api.resend({ email });
  }
}
