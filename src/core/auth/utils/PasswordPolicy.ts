import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';

export function validatePasswordPolicy(
  password: string,
): Result<void, AppError> {
  if (password.length < 15) {
    return err(
      createAppError(
        'VALIDATION_ERROR',
        'Le mot de passe doit contenir au moins 15 caractères.',
        400,
      ),
    );
  }

  if (password.length > 128) {
    return err(
      createAppError(
        'VALIDATION_ERROR',
        'Le mot de passe est trop long (maximum 128 caractères).',
      ),
    );
  }

  return ok(undefined);
}
