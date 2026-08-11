export class LocalPersistenceError extends Error {
  constructor(
    public readonly reason:
      | 'FILE_NOT_FOUND'
      | 'INVALID_DATA'
      | 'CORRUPTED_JSON'
      | 'IO_ERROR'
      | 'INVALID_PATH',
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'LocalPersistenceError';
  }
}
