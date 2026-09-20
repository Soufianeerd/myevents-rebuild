import { z } from 'zod';
import { isSupabasePublicKey } from './supabaseKey';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    APP_MODE: z.enum(['local', 'connected']).default('local'),
    CONNECTED_PROVIDER: z.enum(['neon', 'supabase']).default('neon'),
    DATABASE_URL: z.string().optional(),
    NEON_AUTH_BASE_URL: z.url().optional(),
    NEON_AUTH_COOKIE_SECRET: z.string().min(32).optional(),
    LOCAL_DATA_DIR: z.string().default('.data'),
    APP_URL: z.url().optional(),
    SUPABASE_URL: z.url().optional(),
    SUPABASE_PUBLISHABLE_KEY: z
      .string()
      .refine(isSupabasePublicKey, 'Use a publishable or legacy anon key.')
      .optional(),
    VERCEL: z.string().optional(),
    VERCEL_ENV: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.VERCEL_ENV === 'production')
      ctx.addIssue({
        code: 'custom',
        path: ['VERCEL_ENV'],
        message:
          'Production release is locked until the Revenue Gate is validated.',
      });
    if (value.VERCEL && value.APP_MODE !== 'connected')
      ctx.addIssue({
        code: 'custom',
        path: ['APP_MODE'],
        message: 'Vercel requires connected mode; local JSON is not durable.',
      });
    if (value.APP_MODE === 'connected') {
      if (value.CONNECTED_PROVIDER === 'neon') {
        if (value.DATABASE_URL) {
          let valid = false;
          try {
            const db = new URL(value.DATABASE_URL);
            valid =
              ['postgres:', 'postgresql:'].includes(db.protocol) &&
              db.username === 'myevents_app' &&
              !!db.password &&
              db.hostname.endsWith('.neon.tech') &&
              db.hostname.includes('-pooler.') &&
              db.pathname === '/myevents' &&
              ['require', 'verify-full'].includes(
                db.searchParams.get('sslmode') ?? '',
              ) &&
              !db.hash;
          } catch {}
          if (!valid)
            ctx.addIssue({
              code: 'custom',
              path: ['DATABASE_URL'],
              message:
                'Use the TLS pooled Neon connection for the restricted application role.',
            });
        }
        if (value.NEON_AUTH_BASE_URL) {
          const auth = new URL(value.NEON_AUTH_BASE_URL);
          if (
            auth.protocol !== 'https:' ||
            !auth.hostname.endsWith('.neon.tech') ||
            !auth.hostname.includes('.neonauth.') ||
            auth.pathname !== '/myevents/auth' ||
            auth.search ||
            auth.hash ||
            auth.username ||
            auth.password
          )
            ctx.addIssue({
              code: 'custom',
              path: ['NEON_AUTH_BASE_URL'],
              message: 'Use the Neon Auth endpoint for myevents.',
            });
        }
      }
      for (const key of [
        'APP_URL',
        ...(value.CONNECTED_PROVIDER === 'neon'
          ? ([
              'DATABASE_URL',
              'NEON_AUTH_BASE_URL',
              'NEON_AUTH_COOKIE_SECRET',
            ] as const)
          : (['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY'] as const)),
      ] as const) {
        if (!value[key])
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required in connected mode.`,
          });
      }
      for (const key of [
        'APP_URL',
        ...(value.CONNECTED_PROVIDER === 'supabase'
          ? (['SUPABASE_URL'] as const)
          : []),
      ] as const) {
        if (!value[key]) continue;
        const url = new URL(value[key]);
        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.pathname !== '/' ||
          url.search ||
          url.hash ||
          url.username ||
          url.password
        )
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} must be an HTTP(S) origin without credentials, path, query or fragment.`,
          });
        if (value.NODE_ENV === 'production' && url.protocol !== 'https:')
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: 'HTTPS is required in production.',
          });
      }
    }
  });

// Only Vercel's server-provided Preview hostname may supply the initial origin.
// Never infer auth redirects from a request Host header.
export function deploymentEnvironment(
  input: Record<string, string | undefined>,
) {
  const branch = input.VERCEL_BRANCH_URL || input.VERCEL_URL;
  if (
    !input.APP_URL &&
    input.VERCEL === '1' &&
    input.VERCEL_ENV === 'preview' &&
    branch &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.vercel\.app$/i.test(branch)
  )
    return { ...input, APP_URL: `https://${branch}` };
  return input;
}

const parsed = envSchema.safeParse(deploymentEnvironment(process.env));
if (!parsed.success) {
  // Report field names, never values or credentials.
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`,
  );
}
export const env = parsed.data;
