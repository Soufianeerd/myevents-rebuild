import {
  exportMediaPlan,
  exportName,
  exportSelectionSchema,
} from '@/core/media/export';
import { guestsCsv } from '@/core/guests/models';
import { responsesCsv } from '@/core/guests/responses';
import { eventScope } from '@/server/experience/service';
import { guestState } from '@/server/guests/service';
import { planningState } from '@/server/planning/service';
import { designRepository } from '@/server/designs/service';
import { mediaRepository, mediaStorage } from './service';
import { streamZip, type ArchiveEntry } from './zip';

export async function exportEvent(
  id: string,
  input: unknown,
  signal?: AbortSignal,
) {
  const selection = exportSelectionSchema.parse(input);
  const { event, context, repository } = await eventScope(id);
  const items = await (await mediaRepository()).list(id, context.tenantId);
  const plan = exportMediaPlan(items, id, context.tenantId, selection);
  const root = exportName(event.name);
  const entries: ArchiveEntry[] = [];
  const addText = (path: string, text: string) =>
    entries.push({
      path: `${root}/${path}`,
      bytes: new TextEncoder().encode(text),
    });
  const addJson = (path: string, value: unknown) =>
    addText(path, JSON.stringify(value, null, 2));
  addJson('exports/manifest.json', {
    formatVersion: 1,
    event: { id, name: event.name },
    scope: selection.scope,
    exportedAt: new Date().toISOString(),
    files: plan.map(({ item, path }) => ({
      path,
      id: item.id,
      name: item.name,
      author: item.author,
      mime: item.mime,
      size: item.size,
      favorite: item.favorite,
      hidden: item.hidden,
      createdAt: item.createdAt,
    })),
    pendingFiles:
      selection.scope === 'event'
        ? items.filter((item) => item.status === 'pending').length
        : 0,
  });
  if (selection.scope === 'event') {
    const designs = await designRepository();
    const [invitation, guests, planning, card, requests, orders, spaces] =
      await Promise.all([
        repository.get(id, context.tenantId),
        guestState(id),
        planningState(id),
        designs.get(id, context.tenantId),
        designs.requests(id, context.tenantId),
        repository.orders(id, context.tenantId),
        (await mediaRepository()).spaces(id, context.tenantId),
      ]);
    addJson('exports/evenement.json', {
      id: event.id,
      name: event.name,
      type: event.type,
      startAt: event.startAt,
      endAt: event.endAt,
      timezone: event.timezone,
      primaryLocation: event.primaryLocation,
      defaultLanguage: event.defaultLanguage,
      estimatedGuestCount: event.estimatedGuestCount,
      lifecycleStatus: event.lifecycleStatus,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
    if (invitation)
      addJson('invitation/invitation.json', {
        draft: invitation.draft,
        published: invitation.published,
        revision: invitation.revision,
        publishedRevision: invitation.publishedRevision,
        publishedAt: invitation.publishedAt,
        history: invitation.history,
      });
    addJson('rsvp/reponses.json', guests.responses);
    addText(
      'rsvp/reponses.csv',
      responsesCsv(
        invitation?.published?.fields ?? invitation?.draft.fields ?? [],
        guests.responses,
      ),
    );
    addJson('rsvp/invites.json', guests.document);
    addText('rsvp/invites.csv', guestsCsv(guests.document.guests));
    addJson('exports/organisation.json', planning.document);
    addJson(
      'exports/espaces-souvenirs.json',
      spaces.map(
        ({ kind, enabled, collaborative, availableAt, allowDownload }) => ({
          kind,
          enabled,
          collaborative,
          availableAt,
          allowDownload,
        }),
      ),
    );
    addJson(
      'exports/achats.json',
      orders.map(({ id, offer, status, createdAt, paidAt }) => ({
        id,
        offer,
        status,
        createdAt,
        paidAt,
      })),
    );
    if (card)
      addJson('creation/carte-remerciement.json', {
        document: card.document,
        revision: card.revision,
        updatedAt: card.updatedAt,
      });
    addJson(
      'exports/demandes-impression.json',
      requests.map(
        ({
          id,
          document,
          revision,
          material,
          finish,
          quantity,
          notes,
          status,
          createdAt,
        }) => ({
          id,
          document,
          revision,
          material,
          finish,
          quantity,
          notes,
          status,
          createdAt,
        }),
      ),
    );
  }
  addText(
    'LISEZ-MOI.txt',
    [
      `Souvenirs de ${event.name}`,
      selection.scope === 'event'
        ? 'Cet export contient les fichiers terminés et les données enregistrées de cet événement.'
        : 'Cet export contient uniquement les fichiers sélectionnés et leur inventaire.',
      'Les fichiers sont classés dans photos, videos, audios et creation/fichiers.',
      'exports/manifest.json associe chaque fichier à son nom original, son auteur et son identifiant.',
      'Les dépôts en cours et les fichiers déjà supprimés ne sont pas inclus. Leur nombre en attente figure dans le manifeste.',
      'Les CSV sont lisibles dans un tableur (UTF-8, séparateur point-virgule). Les montants JSON d’organisation sont en centimes.',
      'Les créations sont sauvegardées en JSON. Le PDF de la carte de remerciement se télécharge depuis son éditeur.',
      'Les musiques YouTube/Spotify restent des références externes ; seules les musiques importées sont des fichiers de cette archive.',
      'Ce téléchargement ne supprime aucun fichier de votre compte.',
    ].join('\n'),
  );
  if (plan.length) {
    const storage = await mediaStorage();
    for (const { item, path } of plan)
      entries.push({
        path: `${root}/${path}`,
        size: item.size,
        open: (signal) => storage.stream(item.objectKey, signal),
      });
  }
  return { name: `${root}.zip`, stream: streamZip(entries, signal) };
}
