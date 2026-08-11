import { describe, it, expect } from 'vitest';
import { createId } from '../../../src/core/ids';
import type { UserId, TenantId } from '../../../src/core/ids';

describe('Opaque IDs', () => {
  it('should create an opaque ID from a string', () => {
    const id = createId<UserId>('some-string-value');
    expect(id).toBe('some-string-value');
  });

  it('should be assignable to string at runtime', () => {
    const id = createId<TenantId>('tenant-123');
    const str: string = id;
    expect(str).toBe('tenant-123');
  });
});
