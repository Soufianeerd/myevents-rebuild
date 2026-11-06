import type { ProfileRepository } from '../contracts/ProfileRepository';
import type { UserRepository } from '../contracts/auth/AuthRepositories';
import { profileNamesSchema, type ProfileNames } from '@/core/profile/models';
export class LocalProfileRepository implements ProfileRepository {
  constructor(private users: UserRepository) {}
  async updateNames(userId: string, tenantId: string, input: ProfileNames) {
    const values = profileNamesSchema.parse(input);
    const user = await this.users.findById(userId as never);
    if (!user || user.tenantId !== tenantId)
      throw new Error('Profil indisponible.');
    const result = await this.users.update({
      ...user,
      ...values,
      updatedAt: new Date().toISOString(),
    });
    if (!result.ok) throw new Error('Modification du profil impossible.');
  }
}
