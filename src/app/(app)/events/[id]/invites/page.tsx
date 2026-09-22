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
  const fields = record?.published?.fields ?? record?.draft.fields ?? [];
  return (
    <div className={styles.workspace}>
      <Link href={`/events/${id}`}>← {event.name}</Link>
      <h1>Invités & réponses</h1>
      <Guests
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
          {responses.filter((r) => r.presence === 'yes').length} présents
        </span>
        <span>
          {responses.filter((r) => r.presence === 'no').length} absents
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
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>E-mail</th>
                <th>Présence</th>
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
