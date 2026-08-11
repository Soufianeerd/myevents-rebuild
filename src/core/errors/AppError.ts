export type AppErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'PERSISTENCE_ERROR'
  | 'INVARIANT_VIOLATION';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export const createAppError = (
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>,
): AppError => ({
  code,
  message,
  ...(details ? { details } : {}),
});
