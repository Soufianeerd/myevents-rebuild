import { z } from 'zod';
import { LocalJsonStore } from './persistence/LocalJsonStore';
import { LocalEventRepository } from './LocalEventRepository';
import { LocalExperienceRepository } from './LocalExperienceRepository';
import { assertProduct } from '@/core/commerce/catalog';
import type { MediaRepository } from '../contracts/MediaRepository';
import type {
  MediaItem,
  MediaKind,
  MediaSpace,
  UploadRequest,
} from '@/core/media/models';
interface State {
  spaces: Array<MediaSpace & { hash: string; tenantId: string; title: string }>;
  items: Array<MediaItem & { uploadHash: string }>;
}
export class LocalMediaRepository implements MediaRepository {
  private store: LocalJsonStore<State>;
  private events: LocalEventRepository;
  private experience: LocalExperienceRepository;
  constructor(directory: string) {
    this.store = new LocalJsonStore({
      baseDir: directory,
      collectionName: 'media',
      schema: z.custom<State>(
        (v) => !!v && typeof v === 'object' && 'spaces' in v && 'items' in v,
      ),
    });
    this.events = new LocalEventRepository(directory);
    this.experience = new LocalExperienceRepository(directory);
  }
  async configure(
    id: string,
    tenant: string,
    kind: MediaKind,
    hash: string,
    config: Omit<MediaSpace, 'eventId' | 'kind'>,
  ) {
    const event = await this.events.findById(id as never, tenant as never);
    if (!event) throw new Error('Événement introuvable.');
    assertProduct(await this.experience.entitlements(id, tenant), kind);
    await this.store.update((data) => {
      const state = data ?? { spaces: [], items: [] };
      state.spaces = state.spaces.filter(
        (s) => s.eventId !== id || s.kind !== kind,
      );
      state.spaces.push({
        eventId: id,
        tenantId: tenant,
        kind,
        hash,
        title: event.name,
        ...config,
      });
      return state;
    });
  }
  async spaces(id: string, tenant: string) {
    return ((await this.store.read())?.spaces ?? []).filter(
      (s) => s.eventId === id && s.tenantId === tenant,
    );
  }
  async publicSpace(hash: string) {
    const space = (await this.store.read())?.spaces.find(
      (s) => s.hash === hash && s.enabled,
    );
    if (
      !space ||
      !(await this.events.findById(
        space.eventId as never,
        space.tenantId as never,
      ))
    )
      return null;
    const products = await this.experience.entitlements(
      space.eventId,
      space.tenantId,
    );
    if (!products.includes(space.kind)) return null;
    return {
      eventId: space.eventId,
      kind: space.kind,
      title: space.title,
      collaborative: space.collaborative,
      availableAt: space.availableAt,
      allowDownload: space.allowDownload,
    };
  }
  async reserveDesign(
    eventId: string,
    tenant: string,
    id: string,
    uploadHash: string,
    input: UploadRequest,
  ) {
    const event = await this.events.findById(eventId as never, tenant as never);
    if (!event) throw new Error('Événement introuvable.');
    const products = await this.experience.entitlements(eventId, tenant);
    if (!products.includes('invitation') && !products.includes('thank_you'))
      throw new Error('Activez votre invitation ou vos cartes.');
    if (!input.mime.startsWith('image/') || input.size > 20 * 1024 * 1024)
      throw new Error('Image invalide.');
    const key = `${tenant}/${eventId}/${id}`;
    await this.store.update((data) => {
      const state = data ?? { spaces: [], items: [] };
      if (
        state.items
          .filter((i) => i.tenantId === tenant && i.status !== 'deleted')
          .reduce((sum, i) => sum + i.size, 0) +
          input.size >
        3000000000
      )
        throw new Error('Quota atteint.');
      state.items.push({
        id,
        eventId,
        tenantId: tenant,
        kind: 'photo_video',
        purpose: 'design',
        objectKey: key,
        uploadHash,
        ...input,
        status: 'pending',
        hidden: true,
        favorite: false,
        createdAt: new Date().toISOString(),
      });
      return state;
    });
    return key;
  }
  async publicInvitationImage(hash: string, id: string) {
    const invitation = await this.experience.getPublic(hash);
    if (
      !invitation ||
      !invitation.document.sections.some(
        (s) => s.visible && s.type === 'image' && s.mediaId === id,
      )
    )
      return null;
    const item = (await this.store.read())?.items.find(
      (i) =>
        i.id === id &&
        i.eventId === invitation.eventId &&
        i.status === 'ready' &&
        i.mime.startsWith('image/'),
    );
    return item?.objectKey ?? null;
  }
  async reserve(
    hash: string,
    id: string,
    uploadHash: string,
    input: UploadRequest,
  ) {
    if (!(await this.publicSpace(hash)))
      throw new Error('Espace indisponible.');
    let key = '';
    await this.store.update((data) => {
      const state = data ?? { spaces: [], items: [] };
      const space = state.spaces.find((s) => s.hash === hash && s.enabled);
      if (!space) throw new Error('Espace indisponible.');
      if (
        state.items
          .filter(
            (i) => i.tenantId === space.tenantId && i.status !== 'deleted',
          )
          .reduce((sum, i) => sum + i.size, 0) +
          input.size >
        3000000000
      )
        throw new Error('Quota atteint.');
      key = `${space.tenantId}/${space.eventId}/${id}`;
      state.items.push({
        id,
        eventId: space.eventId,
        tenantId: space.tenantId,
        kind: space.kind,
        objectKey: key,
        uploadHash,
        name: input.name,
        author: input.author,
        mime: input.mime,
        size: input.size,
        status: 'pending',
        hidden: false,
        favorite: false,
        createdAt: new Date().toISOString(),
      });
      return state;
    });
    return key;
  }
  async pending(id: string, hash: string) {
    return (
      (await this.store.read())?.items.find(
        (i) =>
          i.id === id &&
          i.uploadHash === hash &&
          i.status === 'pending' &&
          new Date(i.createdAt).getTime() > Date.now() - 900000,
      ) ?? null
    );
  }
  async complete(
    id: string,
    hash: string,
    size: number,
    mime: string,
    finalKey: string,
  ) {
    await this.store.update((data) => {
      const state = data ?? { spaces: [], items: [] },
        item = state.items.find(
          (i) =>
            i.id === id &&
            i.uploadHash === hash &&
            i.status === 'pending' &&
            new Date(i.createdAt).getTime() > Date.now() - 900000 &&
            i.size === size &&
            i.mime === mime,
        );
      if (!item) throw new Error('Dépôt indisponible.');
      item.status = 'ready';
      item.objectKey = finalKey;
      return state;
    });
  }
  async cancel(id: string, hash: string) {
    await this.store.update((data) => {
      const state = data ?? { spaces: [], items: [] },
        item = state.items.find(
          (i) => i.id === id && i.uploadHash === hash && i.status === 'pending',
        );
      if (item) item.status = 'deleted';
      return state;
    });
  }
  async list(id: string, tenant: string) {
    return ((await this.store.read())?.items ?? []).filter(
      (i) =>
        i.eventId === id && i.tenantId === tenant && i.status !== 'deleted',
    );
  }
  async shared(hash: string) {
    const space = await this.publicSpace(hash);
    if (
      !space?.collaborative ||
      new Date(space.availableAt).getTime() > Date.now()
    )
      return [];
    return ((await this.store.read())?.items ?? [])
      .filter(
        (i) =>
          i.eventId === space.eventId &&
          i.kind === space.kind &&
          i.status === 'ready' &&
          i.purpose !== 'design' &&
          !i.hidden,
      )
      .map((i) => ({
        id: i.id,
        name: i.name,
        author: i.author,
        mime: i.mime,
        size: i.size,
        createdAt: i.createdAt,
        objectKey: i.objectKey,
        allowDownload: space.allowDownload,
      }));
  }
  async moderate(
    id: string,
    event: string,
    tenant: string,
    patch: {
      name?: string;
      hidden?: boolean;
      favorite?: boolean;
      status?: 'deleted';
    },
  ) {
    await this.store.update((data) => {
      const state = data ?? { spaces: [], items: [] },
        item = state.items.find(
          (i) => i.id === id && i.eventId === event && i.tenantId === tenant,
        );
      if (!item) throw new Error('Fichier introuvable.');
      Object.assign(item, patch);
      return state;
    });
  }
}
