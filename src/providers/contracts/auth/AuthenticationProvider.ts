import type { SafeUser } from '@/core/auth/models';
import type { TenantId } from '@/core/ids';
import type { Result } from '@/core/result';
import type { AppError } from '@/core/errors';

export interface AuthIdentity {
  user: SafeUser;
  tenantId: TenantId;
}
export interface AuthenticationProvider {
  readonly confirmationMethod?: 'code';
  verifyEmail?(email: string, code: string): Promise<Result<void, AppError>>;
  resendConfirmation?(email: string): Promise<void>;
  currentIdentity(): Promise<AuthIdentity | null>;
  login(email: string, password: string): Promise<Result<void, AppError>>;
  register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<Result<{ confirmationRequired: boolean }, AppError>>;
  logout(): Promise<void>;
  requestReset(email: string): Promise<void>;
  reset(token: string, password: string): Promise<Result<void, AppError>>;
}
