import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';

export const PASSWORD_MIN_LENGTH = 15;
export const PASSWORD_MAX_LENGTH = 128;

export function validatePasswordPolicy(
  password: string,
): Result<void, AppError> {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return err(
      createAppError(
        'VALIDATION_ERROR',
        'Le mot de passe doit contenir au moins 15 caractères.',
        400,
      ),
    );
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return err(
      createAppError(
        'VALIDATION_ERROR',
        'Le mot de passe est trop long (maximum 128 caractères).',
      ),
    );
  }

  return ok(undefined);
}
