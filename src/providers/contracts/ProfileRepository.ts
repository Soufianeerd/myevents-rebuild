import type { ProfileNames } from '@/core/profile/models';
export interface ProfileRepository {
  updateNames(
    userId: string,
    tenantId: string,
    input: ProfileNames,
  ): Promise<void>;
}
