import { z } from 'zod';
import { isSupabasePublicKey } from './supabaseKey';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    APP_MODE: z.enum(['local', 'connected']).default('local'),
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
      for (const key of [
        'APP_URL',
        'SUPABASE_URL',
        'SUPABASE_PUBLISHABLE_KEY',
      ] as const) {
        if (!value[key])
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required in connected mode.`,
          });
      }
      for (const key of ['APP_URL', 'SUPABASE_URL'] as const) {
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

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Report field names, never values or credentials.
  throw new Error(
    `Invalid environment configuration: ${parsed.error.issues.map((issue) => issue.path.join('.')).join(', ')}`,
  );
}
export const env = parsed.data;
