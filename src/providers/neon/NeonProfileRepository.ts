import { sql } from 'drizzle-orm';
import type { ScopedDatabase } from './database';
import type { ProfileRepository } from '../contracts/ProfileRepository';
import { profileNamesSchema, type ProfileNames } from '@/core/profile/models';
export class NeonProfileRepository implements ProfileRepository {
  constructor(private db: ScopedDatabase) {}
  async updateNames(userId: string, tenantId: string, input: ProfileNames) {
    const names = profileNamesSchema.parse(input);
    const rows = await this.db.query(
      sql`UPDATE myevents.profiles SET first_name=${names.firstName},last_name=${names.lastName},updated_at=now() WHERE id=${userId} AND tenant_id=${tenantId} RETURNING id`,
    );
    if (!rows[0]) throw new Error('Profil indisponible.');
  }
}
