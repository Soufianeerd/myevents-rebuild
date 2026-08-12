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
  details?: Record<string, unknown> | number | string;
}

export const createAppError = (
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown> | number | string,
): AppError => ({
  code,
  message,
  ...(details ? { details } : {}),
});
