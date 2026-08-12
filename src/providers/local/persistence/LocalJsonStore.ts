import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { z } from 'zod';
import { LocalPersistenceError } from './LocalPersistenceError';

export interface LocalJsonStoreConfig<T> {
  baseDir: string;
  collectionName: string;
  schema: z.ZodSchema<T>;
}

export class LocalJsonStore<T> {
  private readonly config: LocalJsonStoreConfig<T>;

  // Static map of queues to prevent concurrent writes on the SAME FILE across MULTIPLE instances
  // Note: This is an intra-process lock, not inter-process.
  private static writeQueues = new Map<string, Promise<void>>();

  constructor(config: LocalJsonStoreConfig<T>) {
    this.config = config;
  }

  /**
   * Resolves and validates the target path to prevent path traversal.
   */
  private getFilePath(): string {
    const { baseDir, collectionName } = this.config;

    // 1. Strict regex validation for the logical collection name
    if (
      !/^[a-zA-Z0-9_.-]+$/.test(collectionName) ||
      collectionName === '.' ||
      collectionName === '..'
    ) {
      throw new LocalPersistenceError(
        'INVALID_PATH',
        `Invalid collection name: ${collectionName}`,
      );
    }

    // Normalize and resolve the absolute paths
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(baseDir, `${collectionName}.json`);

    // 2. Strict relative path verification
    const relative = path.relative(resolvedBase, resolvedTarget);
    if (
      path.isAbsolute(relative) ||
      relative === '..' ||
      relative.startsWith('..' + path.sep)
    ) {
      throw new LocalPersistenceError(
        'INVALID_PATH',
        `Path traversal detected. Cannot access path outside base directory: ${collectionName}`,
      );
    }

    return resolvedTarget;
  }

  /**
   * Reads data from the store. Returns null if the file doesn't exist.
   */
  async read(): Promise<T | null> {
    const filePath = this.getFilePath();

    try {
      const content = await fs.readFile(filePath, 'utf-8');

      let jsonParsed: unknown;
      try {
        jsonParsed = JSON.parse(content);
      } catch (e) {
        throw new LocalPersistenceError(
          'CORRUPTED_JSON',
          'Failed to parse JSON file',
          e,
        );
      }

      const result = this.config.schema.safeParse(jsonParsed);
      if (!result.success) {
        throw new LocalPersistenceError(
          'INVALID_DATA',
          'Data does not match the expected schema',
          result.error,
        );
      }

      return result.data;
    } catch (error) {
      if (error instanceof LocalPersistenceError) {
        throw error;
      }

      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code === 'ENOENT') {
        return null; // File absent is a valid state for first read
      }

      throw new LocalPersistenceError(
        'IO_ERROR',
        `Failed to read file: ${nodeError.message}`,
        error,
      );
    }
  }

  /**
   * Writes data to the store atomically and queues writes to prevent race conditions.
   */
  async write(data: T): Promise<void> {
    const task = async () => {
      const filePath = this.getFilePath();
      const tempFilePath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2)}`;

      // Ensure directory exists
      try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
      } catch (e) {
        throw new LocalPersistenceError(
          'IO_ERROR',
          'Failed to create directory',
          e,
        );
      }

      let serialized: string;
      try {
        // Validate before writing to avoid saving invalid data
        const validated = this.config.schema.parse(data);
        serialized = JSON.stringify(validated, null, 2);
      } catch (e) {
        throw new LocalPersistenceError(
          'INVALID_DATA',
          'Attempted to write invalid data',
          e,
        );
      }

      try {
        // 1. Write to a temporary file
        await fs.writeFile(tempFilePath, serialized, 'utf-8');

        // 2. Rename atomically
        await fs.rename(tempFilePath, filePath);
      } catch (e) {
        // Cleanup temp file if possible
        try {
          await fs.unlink(tempFilePath);
        } catch {
          // ignore cleanup errors
        }
        throw new LocalPersistenceError(
          'IO_ERROR',
          'Failed to perform atomic write',
          e,
        );
      }
    };

    // Serialize writes sequentially by file path
    const filePath = this.getFilePath();
    const currentQueue =
      LocalJsonStore.writeQueues.get(filePath) || Promise.resolve();
    const nextQueue = currentQueue.then(task, task);

    LocalJsonStore.writeQueues.set(filePath, nextQueue);
    return nextQueue;
  }
}
