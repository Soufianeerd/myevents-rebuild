import { describe, it, expect } from 'vitest';
import {
  createAnonymousContext,
  createUserContext,
  isAuthenticated,
  requireAuthentication,
  assertSameTenant,
} from '../../../src/core/access';
import { createId } from '../../../src/core/ids';
import type { UserId, TenantId } from '../../../src/core/ids';
import { isOk, isErr } from '../../../src/core/result';

describe('AccessContext', () => {
  const userId = createId<UserId>('user-1');
  const tenantId = createId<TenantId>('tenant-1');
  const otherTenantId = createId<TenantId>('tenant-2');

  describe('isAuthenticated', () => {
    it('should return false for anonymous context', () => {
      const ctx = createAnonymousContext();
      expect(isAuthenticated(ctx)).toBe(false);
    });

    it('should return true for user context', () => {
      const ctx = createUserContext(userId, tenantId);
      expect(isAuthenticated(ctx)).toBe(true);
    });
  });

  describe('requireAuthentication', () => {
    it('should return an error if anonymous', () => {
      const ctx = createAnonymousContext();
      const result = requireAuthentication(ctx);
      expect(isErr(result)).toBe(true);
      if (!result.ok) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should return ok with context if authenticated', () => {
      const ctx = createUserContext(userId, tenantId);
      const result = requireAuthentication(ctx);
      expect(isOk(result)).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual(ctx);
      }
    });
  });

  describe('assertSameTenant', () => {
    it('should return error if anonymous', () => {
      const ctx = createAnonymousContext();
      const result = assertSameTenant(ctx, tenantId);
      expect(isErr(result)).toBe(true);
      if (!result.ok) {
        expect(result.error.code).toBe('UNAUTHORIZED');
      }
    });

    it('should return error if tenant does not match', () => {
      const ctx = createUserContext(userId, tenantId);
      const result = assertSameTenant(ctx, otherTenantId);
      expect(isErr(result)).toBe(true);
      if (!result.ok) {
        expect(result.error.code).toBe('FORBIDDEN');
      }
    });

    it('should return ok if tenant matches', () => {
      const ctx = createUserContext(userId, tenantId);
      const result = assertSameTenant(ctx, tenantId);
      expect(isOk(result)).toBe(true);
    });
  });
});
