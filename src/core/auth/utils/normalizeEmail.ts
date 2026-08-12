import { z } from 'zod';
import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';

export function normalizeEmail(email: string): Result<string, AppError> {
  const trimmed = email.trim();
  const parsed = z.string().email().safeParse(trimmed);

  if (!parsed.success) {
    return err(createAppError('VALIDATION_ERROR', 'Adresse e-mail invalide.'));
  }

  return ok(parsed.data.toLowerCase());
}
