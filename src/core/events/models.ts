import { EventId, WorkspaceId, TenantId, UserId, EventMemberId } from '../ids';

export type EventLifecycleStatus = 'draft' | 'published' | 'archived';

export interface Event {
  id: EventId;
  workspaceId: WorkspaceId;
  tenantId: TenantId; // Redundant but good for isolation queries
  createdBy: UserId;

  type: string; // e.g. 'wedding'
  name: string; // e.g. "Mariage de A & B"

  startAt: string; // ISO 8601
  endAt?: string; // ISO 8601
  timezone: string; // e.g. "Europe/Paris"

  primaryLocation?: string;
  defaultLanguage: string; // e.g. "fr"
  estimatedGuestCount?: number;

  lifecycleStatus: EventLifecycleStatus;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // Soft delete
}

export type EventMemberRole = 'owner' | 'admin' | 'editor' | 'readonly';

export interface EventMember {
  id: EventMemberId;
  eventId: EventId;
  userId: UserId;
  role: EventMemberRole;
  createdAt: string;
}
