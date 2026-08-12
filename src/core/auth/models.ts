import { UserId, TenantId, OpaqueId } from '../ids';

export type SessionId = OpaqueId<'SessionId'>;
export type PasswordResetTokenId = OpaqueId<'PasswordResetTokenId'>;

export interface PasswordParams {
  N: number;
  r: number;
  p: number;
}

export interface User {
  id: UserId;
  tenantId: TenantId; // The individual tenant created for this B2C user
  email: string; // Normalized lowercase
  displayName: string;

  // Security
  passwordHash: string; // The hashed scrypt derived key
  passwordSalt: string; // The randomly generated salt
  passwordAlgorithm: string; // 'scrypt'
  passwordParams: PasswordParams;
  passwordUpdatedAt: string; // ISO 8601

  // Auditing
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface SafeUser {
  id: UserId;
  displayName: string;
  email: string;
}

export interface Session {
  id: SessionId;
  userId: UserId;
  tokenHash: string; // SHA-256 of the raw 32-byte opaque token
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  lastSeenAt?: string; // ISO 8601
}

export interface PasswordResetToken {
  id: PasswordResetTokenId;
  userId: UserId;
  tokenHash: string; // SHA-256 of the raw 32-byte token
  createdAt: string; // ISO 8601
  expiresAt: string; // ISO 8601
  usedAt?: string; // ISO 8601
}
