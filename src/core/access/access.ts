import type { TenantId, UserId } from '../ids';
import type { Result } from '../result';
import { ok, err } from '../result';
import type { AppError } from '../errors';
import { createAppError } from '../errors';

export interface AnonymousAccessContext {
  kind: 'anonymous';
}

export interface UserAccessContext {
  kind: 'user';
  userId: UserId;
  tenantId: TenantId;
}

export type AccessContext = AnonymousAccessContext | UserAccessContext;

/**
 * Creates an anonymous context.
 */
export const createAnonymousContext = (): AnonymousAccessContext => ({
  kind: 'anonymous',
});

/**
 * Creates a user context.
 */
export const createUserContext = (
  userId: UserId,
  tenantId: TenantId,
): UserAccessContext => ({
  kind: 'user',
  userId,
  tenantId,
});

/**
 * Type guard to check if context is authenticated.
 */
export const isAuthenticated = (
  context: AccessContext,
): context is UserAccessContext => {
  return context.kind === 'user';
};

/**
 * Asserts that the context is authenticated, returning a UserAccessContext or an AppError.
 */
export const requireAuthentication = (
  context: AccessContext,
): Result<UserAccessContext, AppError> => {
  if (!isAuthenticated(context)) {
    return err(
      createAppError(
        'UNAUTHORIZED',
        'User must be authenticated to perform this action.',
      ),
    );
  }
  return ok(context);
};

/**
 * Asserts that the provided context belongs to the required tenant.
 * Returns an error if the context is anonymous or belongs to a different tenant.
 */
export const assertSameTenant = (
  context: AccessContext,
  resourceTenantId: TenantId,
): Result<true, AppError> => {
  if (!isAuthenticated(context)) {
    return err(
      createAppError(
        'UNAUTHORIZED',
        'Authentication required to access tenant resources.',
      ),
    );
  }

  if (context.tenantId !== resourceTenantId) {
    return err(
      createAppError(
        'FORBIDDEN',
        'User does not have access to this tenant resource.',
        {
          expectedTenantId: resourceTenantId,
          actualTenantId: context.tenantId,
        },
      ),
    );
  }

  return ok(true);
};
