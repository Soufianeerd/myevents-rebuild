import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr } from '../../../src/core/result';

describe('Result', () => {
  it('should create an ok result', () => {
    const result = ok('success value');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('success value');
    }
  });

  it('should create an err result', () => {
    const result = err('error value');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('error value');
    }
  });

  it('should correctly identify isOk', () => {
    const res = ok(42);
    expect(isOk(res)).toBe(true);
    expect(isErr(res)).toBe(false);
  });

  it('should correctly identify isErr', () => {
    const res = err('Error');
    expect(isErr(res)).toBe(true);
    expect(isOk(res)).toBe(false);
  });
});
