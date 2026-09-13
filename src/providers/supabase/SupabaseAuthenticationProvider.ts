import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthenticationProvider } from '../contracts/auth/AuthenticationProvider';
import type { UserId, TenantId } from '@/core/ids';
import { validatePasswordPolicy } from '@/core/auth/utils/PasswordPolicy';
import { ok, err } from '@/core/result';
import { createAppError } from '@/core/errors';
import { z } from 'zod';

const profileSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
});
const invalidCredentials = () =>
  createAppError(
    'UNAUTHORIZED',
    'Adresse e-mail ou mot de passe incorrect.',
    401,
  );

export class SupabaseAuthenticationProvider implements AuthenticationProvider {
  constructor(
    private client: SupabaseClient,
    private appUrl: string,
  ) {}

  async currentIdentity() {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();
    if (error || !user) return null;
    const { data, error: profileError } = await this.client
      .from('profiles')
      .select('id,tenant_id,first_name,last_name')
      .eq('id', user.id)
      .single();
    if (profileError)
      throw new Error(
        'Unable to load authenticated profile. Verify Supabase migrations.',
      );
    const profile = profileSchema.parse(data);
    return {
      tenantId: profile.tenant_id as TenantId,
      user: {
        id: profile.id as UserId,
        firstName: profile.first_name,
        lastName: profile.last_name,
        displayName: `${profile.first_name} ${profile.last_name}`.trim(),
        email: user.email || '',
      },
    };
  }
  async login(email: string, password: string) {
    const { error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    return error ? err(invalidCredentials()) : ok(undefined);
  }
  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const policy = validatePasswordPolicy(input.password);
    if (!policy.ok) return err(policy.error);
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: { first_name: input.firstName, last_name: input.lastName },
        emailRedirectTo: `${this.appUrl}/auth/confirm`,
      },
    });
    if (error)
      return err(
        createAppError(
          'VALIDATION_ERROR',
          'Impossible de créer ce compte. Vérifiez les informations ou réessayez plus tard.',
        ),
      );
    return ok({ confirmationRequired: !data.session });
  }
  async logout() {
    const { error } = await this.client.auth.signOut({ scope: 'local' });
    if (error) throw new Error('Unable to sign out. Please retry.');
  }
  async requestReset(email: string) {
    // Supabase Auth enforces its server-side rate limits. Always return the same UI state.
    await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.appUrl}/reinitialiser-mot-de-passe`,
    });
  }
  async reset(token: string, password: string) {
    const policy = validatePasswordPolicy(password);
    if (!policy.ok) return err(policy.error);
    const invalid = () =>
      err(
        createAppError(
          'VALIDATION_ERROR',
          'Ce lien de réinitialisation est invalide ou a expiré.',
          400,
        ),
      );
    // Recovery email template supplies TokenHash. Verification happens on POST,
    // after policy validation, so mail scanners and invalid input cannot consume it.
    const { data, error } = await this.client.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });
    if (error || !data.user) return invalid();
    const updated = await this.client.auth.updateUser({ password });
    if (updated.error) {
      await this.client.auth.signOut({ scope: 'local' });
      return err(
        createAppError(
          'VALIDATION_ERROR',
          'Le mot de passe n’a pas pu être modifié. Demandez un nouveau lien.',
        ),
      );
    }
    const signedOut = await this.client.auth.signOut({ scope: 'global' });
    if (signedOut.error)
      throw new Error('Password updated but session revocation failed.');
    return ok(undefined);
  }
}
