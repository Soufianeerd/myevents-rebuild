import { responseColumns } from '@/core/guests/responses';
import Link from 'next/link';
import Guests from './Guests';
import { guestState } from '@/server/guests/service';
import { eventScope } from '@/server/experience/service';
import styles from '../workspace.module.css';
export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { event, context, repository } = await eventScope(id);
  const [record, responses] = await Promise.all([
    repository.get(id, context.tenantId),
    repository.responses(id, context.tenantId),
  ]);
  const contacts = await guestState(id);
  const fields = responseColumns(
    record?.published?.fields ?? record?.draft.fields ?? [],
    responses,
  );
  return (
    <div className={styles.workspace}>
      <Link href={`/events/${id}`}>← {event.name}</Link>
      <h1>Invités & réponses</h1>
      <Guests
        responses={responses}
        eventId={id}
        initial={contacts.document}
        revision={contacts.revision}
      />
      <h2>Réponses reçues</h2>
      <p>
        Les réponses envoyées depuis votre invitation apparaissent ici. Les
        colonnes suivent vos questions RSVP.
      </p>
      <div className={styles.stats}>
        <span>{responses.length} réponses</span>
        <span>
          {responses.filter((r) => r.presence === 'yes').length} réponses
          positives
        </span>
        <span>
          {responses.filter((r) => r.presence === 'no').length} réponses
          négatives
        </span>
      </div>
      <a className={styles.link} href={`/events/${id}/invites/export`}>
        Exporter les réponses CSV
      </a>
      {!responses.length ? (
        <div className={styles.notice}>
          Aucune réponse pour le moment. Publiez votre invitation depuis le
          Studio, puis partagez son lien.
        </div>
      ) : (
        <div
          className={styles.tableWrap}
          role="region"
          aria-label="Tableau des réponses reçues"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Présence</th>
                <th>Accompagnants</th>
                <th>Contact associé</th>
                <th>Foyer déclaré</th>
                {fields.map((f) => (
                  <th key={f.id}>{f.label}</th>
                ))}
                <th>Réponse reçue</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.presence === 'yes' ? 'Présent' : 'Absent'}</td>
                  <td>{r.companions ?? 0}</td>
                  <td>
                    {contacts.document.guests.find(
                      (g) => g.id === r.guestId || g.responseId === r.id,
                    )?.name ??
                      (r.guestId ? 'Contact retiré du carnet' : 'Lien général')}
                  </td>
                  <td>
                    {r.household ||
                      contacts.document.guests.find(
                        (guest) => guest.id === r.guestId,
                      )?.household ||
                      '—'}
                  </td>
                  {fields.map((f) => (
                    <td key={f.id}>
                      {Array.isArray(r.answers[f.id])
                        ? (r.answers[f.id] as string[]).join(', ')
                        : typeof r.answers[f.id] === 'boolean'
                          ? r.answers[f.id]
                            ? 'Oui'
                            : 'Non'
                          : String(r.answers[f.id] ?? '—')}
                    </td>
                  ))}
                  <td>{new Date(r.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
