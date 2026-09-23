import Link from 'next/link';
import { ownerMedia } from '@/server/media/service';
import { tokenFor } from '@/server/experience/service';
import { UploadForm } from '@/components/media/UploadForm';
import { SpaceControls, MediaControls } from './Controls';
import styles from '../workspace.module.css';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await ownerMedia(id);
  const products = data.products;
  return (
    <div className={styles.workspace}>
      <Link href={`/events/${id}`}>← Mon événement</Link>
      <h1>QR codes & souvenirs</h1>
      <p>Les voix, les regards, les instants : gardez ce qui compte.</p>
      <div className={styles.grid}>
        {(['photo_video', 'audio'] as const).map((kind) => {
          const purchased = products.includes(kind);
          const existing = data.spaces.find((s) => s.kind === kind);
          const space = existing ?? {
            eventId: id,
            kind,
            enabled: true,
            collaborative: false,
            availableAt: new Date(
              new Date(data.event.endAt ?? data.event.startAt).getTime() +
                86400000,
            ).toISOString(),
            allowDownload: false,
          };
          return (
            <section className={styles.card} key={kind}>
              <h2>
                {kind === 'audio' ? 'Livre d’or audio' : 'Photos & vidéos'}
              </h2>
              {purchased ? (
                <>
                  <SpaceControls eventId={id} space={space} />
                  {existing?.enabled && (
                    <>
                      <img
                        src={`/events/${id}/souvenirs/qr?kind=${kind}`}
                        alt={`QR code ${kind === 'audio' ? 'audio' : 'photos et vidéos'}`}
                        width={220}
                        height={220}
                      />
                      <p>
                        <a
                          href={data.links[kind]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ouvrir l’espace invité
                        </a>
                      </p>
                      <p>
                        <a
                          href={`/events/${id}/souvenirs/qr?kind=${kind}&download=1`}
                        >
                          Télécharger le QR code
                        </a>
                      </p>
                      <UploadForm token={tokenFor(id, kind)} kind={kind} />
                    </>
                  )}
                </>
              ) : (
                <>
                  <p>Cette option n’est pas activée pour cet événement.</p>
                  <Link href={`/events/${id}/offres`}>Choisir une formule</Link>
                </>
              )}
            </section>
          );
        })}
      </div>
      <h2>Vos souvenirs reçus</h2>
      <p>
        {data.items.filter((i) => i.status === 'ready').length} souvenirs ·{' '}
        {(data.usedBytes / 1000000).toFixed(1)} Mo pour cet événement, images du
        Studio comprises
      </p>
      <div className={styles.grid}>
        {data.items.map((item) => (
          <article className={styles.card} key={item.id}>
            <h2>{item.name}</h2>
            {item.url ? (
              item.mime.startsWith('audio/') ? (
                <audio controls src={item.url} />
              ) : item.mime.startsWith('video/') ? (
                <video controls src={item.url} style={{ width: '100%' }} />
              ) : (
                <img src={item.url} alt={item.name} style={{ width: '100%' }} />
              )
            ) : (
              <p>Dépôt en attente de validation.</p>
            )}
            <p>
              {item.author} ·{' '}
              {new Date(item.createdAt).toLocaleDateString('fr-FR')}
            </p>
            <MediaControls eventId={id} item={item} />
          </article>
        ))}
      </div>
    </div>
  );
}
