import { z } from 'zod';

const envSchema = z.object({
  APP_MODE: z.enum(['local', 'production', 'test']).default('local'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('Invalid environment variables', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
