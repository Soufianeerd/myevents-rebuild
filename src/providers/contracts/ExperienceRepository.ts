import type {
  InvitationDocument,
  InvitationRecord,
  PublicInvitation,
  RsvpResponse,
} from '@/core/invitations/models';
import type { Order, ProductKey } from '@/core/commerce/catalog';
export interface ExperienceRepository {
  entitlements(eventId: string, tenantId: string): Promise<ProductKey[]>;
  activatePreview(eventId: string, tenantId: string): Promise<void>;
  get(eventId: string, tenantId: string): Promise<InvitationRecord | null>;
  save(
    eventId: string,
    tenantId: string,
    document: InvitationDocument,
    revision: number,
    now: string,
  ): Promise<InvitationRecord>;
  publish(
    eventId: string,
    tenantId: string,
    revision: number,
    tokenHash: string,
    now: string,
  ): Promise<void>;
  suspend(eventId: string, tenantId: string): Promise<void>;
  getPublic(tokenHash: string): Promise<PublicInvitation | null>;
  respond(
    tokenHash: string,
    response: RsvpResponse,
    revision: number,
    now: string,
  ): Promise<void>;
  responses(
    eventId: string,
    tenantId: string,
  ): Promise<Array<RsvpResponse & { createdAt: string }>>;
  orders(eventId: string, tenantId: string): Promise<Order[]>;
  createOrder(order: Order): Promise<void>;
  attachSession(
    orderId: string,
    tenantId: string,
    sessionId: string,
  ): Promise<void>;
  fulfill(
    orderId: string,
    sessionId: string,
    amount: number,
    now: string,
    secret: string,
  ): Promise<void>;
}
