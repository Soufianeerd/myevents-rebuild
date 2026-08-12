import { describe, it, expect } from 'vitest';
import { normalizeEmail } from '../../../../src/core/auth/utils/normalizeEmail';

describe('normalizeEmail', () => {
  it('should trim and lowercase valid emails', () => {
    const result = normalizeEmail('  Test@Example.com  ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('test@example.com');
    }
  });

  it('should reject invalid emails', () => {
    const result = normalizeEmail('not-an-email');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });
});
