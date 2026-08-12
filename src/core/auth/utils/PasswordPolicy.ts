import { Result, ok, err } from '../../result';
import { AppError, createAppError } from '../../errors';

export function validatePasswordPolicy(
  password: string,
): Result<void, AppError> {
  if (password.length < 8) {
    return err(
      createAppError(
        'VALIDATION_ERROR',
        'Le mot de passe doit contenir au moins 8 caractères.',
        400,
      ),
    );
  }

  if (password.length > 256) {
    return err(
      createAppError('VALIDATION_ERROR', 'Le mot de passe est trop long.'),
    );
  }

  return ok(undefined);
}
