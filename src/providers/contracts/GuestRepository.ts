import type { GuestBook, GuestBookRecord } from '@/core/guests/models';
export interface GuestRepository {
  get(eventId: string, tenantId: string): Promise<GuestBookRecord | null>;
  save(
    eventId: string,
    tenantId: string,
    document: GuestBook,
    revision: number,
  ): Promise<GuestBookRecord>;
}
