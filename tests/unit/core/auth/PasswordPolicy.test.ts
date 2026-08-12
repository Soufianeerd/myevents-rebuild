import { describe, it, expect } from 'vitest';
import { validatePasswordPolicy } from '../../../../src/core/auth/utils/PasswordPolicy';

describe('validatePasswordPolicy', () => {
  it('should accept valid passwords', () => {
    const result = validatePasswordPolicy('ValidPassword123!');
    expect(result.ok).toBe(true);
  });

  it('should reject passwords shorter than 8 characters', () => {
    const result = validatePasswordPolicy('short');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });

  it('should reject overly long passwords', () => {
    const longPwd = 'a'.repeat(257);
    const result = validatePasswordPolicy(longPwd);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('VALIDATION_ERROR');
    }
  });
});
