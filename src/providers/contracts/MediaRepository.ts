import type {
  MediaItem,
  MediaKind,
  MediaSpace,
  UploadRequest,
} from '@/core/media/models';
export type PublicMediaSpace = {
  eventId: string;
  kind: MediaKind;
  title: string;
  collaborative: boolean;
  availableAt: string;
  allowDownload: boolean;
};
export interface MediaRepository {
  configure(
    eventId: string,
    tenantId: string,
    kind: MediaKind,
    hash: string,
    config: Omit<MediaSpace, 'eventId' | 'kind'>,
  ): Promise<void>;
  spaces(eventId: string, tenantId: string): Promise<MediaSpace[]>;
  publicSpace(hash: string): Promise<PublicMediaSpace | null>;
  reserve(
    hash: string,
    id: string,
    uploadHash: string,
    input: UploadRequest,
  ): Promise<string>;
  pending(id: string, uploadHash: string): Promise<MediaItem | null>;
  complete(
    id: string,
    uploadHash: string,
    size: number,
    mime: string,
    finalKey: string,
  ): Promise<void>;
  cancel(id: string, uploadHash: string): Promise<void>;
  list(eventId: string, tenantId: string): Promise<MediaItem[]>;
  shared(
    hash: string,
  ): Promise<
    Array<
      Pick<
        MediaItem,
        'id' | 'name' | 'author' | 'mime' | 'size' | 'createdAt' | 'objectKey'
      > & { allowDownload: boolean }
    >
  >;
  moderate(
    id: string,
    eventId: string,
    tenantId: string,
    patch: {
      name?: string;
      hidden?: boolean;
      favorite?: boolean;
      status?: 'deleted';
    },
  ): Promise<void>;
}
