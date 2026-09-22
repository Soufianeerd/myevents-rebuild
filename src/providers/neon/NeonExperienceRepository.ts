import { sql } from 'drizzle-orm';
import type { ScopedDatabase } from './database';
import type { ExperienceRepository } from '../contracts/ExperienceRepository';
import {
  invitationDocumentSchema,
  invitedGuestSchema,
  type InvitationDocument,
  type InvitationRecord,
  type RsvpResponse,
} from '@/core/invitations/models';
import {
  productKeys,
  type ProductKey,
  type Order,
} from '@/core/commerce/catalog';
function record(row: Record<string, unknown>): InvitationRecord {
  return {
    eventId: String(row.event_id),
    tenantId: String(row.tenant_id),
    draft: invitationDocumentSchema.parse(row.draft),
    published: row.published
      ? invitationDocumentSchema.parse(row.published)
      : null,
    revision: Number(row.revision),
    publishedRevision: row.published_revision
      ? Number(row.published_revision)
      : null,
    publishedAt: row.published_at
      ? new Date(String(row.published_at)).toISOString()
      : null,
    history: row.history as InvitationRecord['history'],
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}
export class NeonExperienceRepository implements ExperienceRepository {
  constructor(private db: ScopedDatabase) {}
  async entitlements(id: string, tenant: string): Promise<ProductKey[]> {
    const rows = await this.db.query(
      sql`SELECT product FROM myevents.event_entitlements WHERE event_id=${id} AND tenant_id=${tenant}`,
    );
    return rows
      .map((r) => String(r.product))
      .filter((p): p is ProductKey => productKeys.includes(p as ProductKey));
  }
  async activatePreview(id: string, _tenant: string) {
    void _tenant;
    await this.db.query(sql`SELECT myevents.activate_preview(${id})`);
  }
  async get(id: string, tenant: string) {
    const rows = await this.db.query(
      sql`SELECT * FROM myevents.invitations WHERE event_id=${id} AND tenant_id=${tenant}`,
    );
    return rows[0] ? record(rows[0]) : null;
  }
  async save(
    id: string,
    tenant: string,
    draft: InvitationDocument,
    revision: number,
    now: string,
  ) {
    const version = JSON.stringify([
      { revision: revision + 1, createdAt: now, document: draft },
    ]);
    const rows = await this.db.query(
      sql`INSERT INTO myevents.invitations(event_id,tenant_id,draft,revision,history,updated_at) SELECT ${id},${tenant},${JSON.stringify(draft)}::jsonb,1,${version}::jsonb,${now} WHERE ${revision}=0 ON CONFLICT(event_id) DO UPDATE SET draft=excluded.draft,revision=myevents.invitations.revision+1,history=myevents.invitations.history||excluded.history,updated_at=excluded.updated_at WHERE myevents.invitations.revision=${revision} AND myevents.invitations.tenant_id=${tenant} RETURNING *`,
    );
    // A revision greater than zero must use UPDATE: INSERT SELECT intentionally creates no row.
    if (revision > 0) {
      const updated = await this.db.query(
        sql`UPDATE myevents.invitations SET draft=${JSON.stringify(draft)}::jsonb,revision=revision+1,history=history||${version}::jsonb,updated_at=${now} WHERE event_id=${id} AND tenant_id=${tenant} AND revision=${revision} RETURNING *`,
      );
      if (updated[0]) return record(updated[0]);
    }
    if (!rows[0])
      throw new Error(
        'Une autre version a été enregistrée. Rechargez le Studio.',
      );
    return record(rows[0]);
  }
  async publish(
    id: string,
    _tenant: string,
    revision: number,
    hash: string,
    _now: string,
  ) {
    void _tenant;
    void _now;
    await this.db.query(
      sql`SELECT myevents.publish_invitation(${id},${revision},${hash})`,
    );
  }
  async suspend(id: string, _tenant: string) {
    void _tenant;
    await this.db.query(sql`SELECT myevents.suspend_invitation(${id})`);
  }
  async issueGuestLink(
    id: string,
    _tenant: string,
    guestId: string,
    hash: string,
  ) {
    void _tenant;
    await this.db.query(
      sql`SELECT myevents.issue_guest_link(${id},${guestId},${hash})`,
    );
  }
  async getPublic(hash: string) {
    let rows = await this.db.query(
      sql`SELECT * FROM myevents.public_invitation(${hash})`,
    );
    if (!rows.length)
      rows = await this.db.query(
        sql`SELECT * FROM myevents.public_guest_invitation(${hash})`,
      );
    return rows[0]
      ? {
          eventId: String(rows[0].event_id),
          guest: rows[0].guest
            ? invitedGuestSchema.parse(rows[0].guest)
            : undefined,
          document: invitationDocumentSchema.parse(rows[0].document),
          revision: Number(rows[0].revision),
        }
      : null;
  }
  async respond(
    hash: string,
    response: RsvpResponse,
    revision: number,
    _now: string,
  ) {
    void _now;
    await this.db.query(
      response.guestId
        ? sql`SELECT myevents.submit_guest_rsvp(${hash},${JSON.stringify(response)}::jsonb,${revision})`
        : sql`SELECT myevents.submit_rsvp(${hash},${JSON.stringify(response)}::jsonb,${revision})`,
    );
  }
  async responses(id: string, tenant: string) {
    return (
      await this.db.query(
        sql`SELECT response,created_at FROM myevents.rsvp_responses WHERE event_id=${id} AND tenant_id=${tenant} ORDER BY created_at DESC`,
      )
    ).map((r) => ({
      ...(r.response as RsvpResponse),
      createdAt: new Date(String(r.created_at)).toISOString(),
    }));
  }
  async orders(id: string, tenant: string) {
    return (
      await this.db.query(
        sql`SELECT * FROM myevents.orders WHERE event_id=${id} AND tenant_id=${tenant} ORDER BY created_at DESC`,
      )
    ).map((r) => ({
      id: String(r.id),
      eventId: String(r.event_id),
      tenantId: String(r.tenant_id),
      offer: r.offer as Order['offer'],
      status: r.status as Order['status'],
      sessionId: r.session_id ? String(r.session_id) : null,
      createdAt: new Date(String(r.created_at)).toISOString(),
      paidAt: r.paid_at ? new Date(String(r.paid_at)).toISOString() : null,
    }));
  }
  async createOrder(order: Order) {
    await this.db.query(
      sql`INSERT INTO myevents.orders(id,event_id,tenant_id,offer,created_at) VALUES(${order.id},${order.eventId},${order.tenantId},${JSON.stringify(order.offer)}::jsonb,${order.createdAt})`,
    );
  }
  async attachSession(id: string, tenant: string, session: string) {
    const rows = await this.db.query(
      sql`UPDATE myevents.orders SET session_id=${session} WHERE id=${id} AND tenant_id=${tenant} AND status='pending' AND (session_id IS NULL OR session_id=${session}) RETURNING id`,
    );
    if (!rows.length) throw new Error('Commande indisponible.');
  }
  async fulfill(
    id: string,
    session: string,
    amount: number,
    _now: string,
    secret: string,
  ) {
    void _now;
    await this.db.query(
      sql`SELECT myevents.fulfill_order(${id},${session},${amount},${secret})`,
    );
  }
}
