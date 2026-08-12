import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { z } from 'zod';
import { LocalJsonStore } from '../../../../../src/providers/local/persistence/LocalJsonStore';
import { LocalPersistenceError } from '../../../../../src/providers/local/persistence/LocalPersistenceError';

describe('LocalJsonStore Integration', () => {
  const testSchema = z.object({
    name: z.string(),
    value: z.number(),
  });

  type TestData = z.infer<typeof testSchema>;

  let baseDir: string;
  let store: LocalJsonStore<TestData>;

  beforeEach(async () => {
    baseDir = path.resolve(
      __dirname,
      '../../../../.data-e2e',
      `test-${Date.now()}-${Math.random()}`,
    );
    await fs.mkdir(baseDir, { recursive: true });

    store = new LocalJsonStore({
      baseDir,
      collectionName: 'test_collection',
      schema: testSchema,
    });
  });

  afterEach(async () => {
    try {
      await fs.rm(baseDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  it('1. should return null on first read without file', async () => {
    const data = await store.read();
    expect(data).toBeNull();
  });

  it('2. should write then read', async () => {
    await store.write({ name: 'test', value: 42 });
    const data = await store.read();
    expect(data).toEqual({ name: 'test', value: 42 });
  });

  it('3. data persisted should be valid JSON in the file', async () => {
    await store.write({ name: 'persist', value: 99 });
    const fileContent = await fs.readFile(
      path.join(baseDir, 'test_collection.json'),
      'utf-8',
    );
    const parsed = JSON.parse(fileContent);
    expect(parsed).toEqual({ name: 'persist', value: 99 });
  });

  it('4. should create the directory automatically', async () => {
    const customStore = new LocalJsonStore({
      baseDir: path.join(baseDir, 'nested/folder'),
      collectionName: 'auto_create',
      schema: testSchema,
    });
    await customStore.write({ name: 'nested', value: 1 });
    const data = await customStore.read();
    expect(data).toEqual({ name: 'nested', value: 1 });
  });

  it('5. should detect corrupted JSON', async () => {
    const filePath = path.join(baseDir, 'test_collection.json');
    await fs.writeFile(filePath, '{ invalid json', 'utf-8');

    await expect(store.read()).rejects.toThrow(LocalPersistenceError);
    await expect(store.read()).rejects.toHaveProperty(
      'reason',
      'CORRUPTED_JSON',
    );
  });

  it('6. should reject data not matching Zod schema on read', async () => {
    const filePath = path.join(baseDir, 'test_collection.json');
    await fs.writeFile(
      filePath,
      JSON.stringify({ name: 'test', value: 'not a number' }),
      'utf-8',
    );

    await expect(store.read()).rejects.toThrow(LocalPersistenceError);
    await expect(store.read()).rejects.toHaveProperty('reason', 'INVALID_DATA');
  });

  it('should reject data not matching Zod schema on write', async () => {
    await expect(
      store.write({
        name: 'test',
        value: 'not a number',
      } as unknown as TestData),
    ).rejects.toThrow(LocalPersistenceError);
    await expect(
      store.write({
        name: 'test',
        value: 'not a number',
      } as unknown as TestData),
    ).rejects.toHaveProperty('reason', 'INVALID_DATA');
  });

  it('7. should reject path traversal and invalid characters', async () => {
    const badNames = [
      '../secret',
      '../../secret',
      '/absolute/path',
      'nested/file',
      'nested\\\\file',
      '..',
      '.',
    ];

    for (const name of badNames) {
      const traversalStore = new LocalJsonStore({
        baseDir,
        collectionName: name,
        schema: testSchema,
      });

      await expect(traversalStore.read()).rejects.toThrow(
        LocalPersistenceError,
      );
      await expect(traversalStore.read()).rejects.toHaveProperty(
        'reason',
        'INVALID_PATH',
      );

      await expect(
        traversalStore.write({ name: 'a', value: 1 }),
      ).rejects.toThrow(LocalPersistenceError);
    }
  });

  it('8. should handle two successive writes correctly', async () => {
    await store.write({ name: 'first', value: 1 });
    await store.write({ name: 'second', value: 2 });

    const data = await store.read();
    expect(data).toEqual({ name: 'second', value: 2 });
  });

  it('9. should handle concurrent writes safely without corruption', async () => {
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(store.write({ name: `concurrent_${i}`, value: i }));
    }

    await Promise.all(promises);

    // The final state should be valid JSON matching schema
    const data = await store.read();
    expect(data).toBeDefined();
    expect(data?.name).toContain('concurrent_');
    expect(typeof data?.value).toBe('number');
  });
  it('10. should handle concurrent writes across MULTIPLE instances of the same file safely', async () => {
    const storeA = new LocalJsonStore({
      baseDir,
      collectionName: 'shared_collection',
      schema: testSchema,
    });
    const storeB = new LocalJsonStore({
      baseDir,
      collectionName: 'shared_collection',
      schema: testSchema,
    });

    const promises = [];
    for (let i = 0; i < 25; i++) {
      promises.push(storeA.write({ name: `storeA_${i}`, value: i }));
      promises.push(storeB.write({ name: `storeB_${i}`, value: i }));
    }

    await Promise.all(promises);

    const dataA = await storeA.read();
    const dataB = await storeB.read();

    expect(dataA).toBeDefined();
    expect(dataB).toBeDefined();
    expect(dataA).toEqual(dataB); // Should read the exact same valid state
    expect(dataA?.name).toMatch(/store(A|B)_/);
  });
});
