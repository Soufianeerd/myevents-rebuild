import Link from 'next/link';
import { ownerMedia } from '@/server/media/service';
import { tokenFor } from '@/server/experience/service';
import { UploadForm } from '@/components/media/UploadForm';
import { Gallery } from './Gallery';
import { storageAlert } from '@/core/media/models';
import { SpaceControls } from './Controls';
import styles from '../workspace.module.css';
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await ownerMedia(id);
  const products = data.products;
  const usage = storageAlert(data.usage);
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
        {
          data.items.filter(
            (i) => i.status === 'ready' && i.purpose !== 'design',
          ).length
        }{' '}
        souvenirs · {(data.usedBytes / 1000000).toFixed(1)} Mo pour cet
        événement, images du Studio comprises
      </p>
      <section className={styles.card} aria-label="Stockage du compte">
        <h2>Votre stockage</h2>
        <p>
          {(data.usage.total / 1000000000).toFixed(2)} Go sur 3 Go · tous vos
          événements
        </p>
        <progress
          aria-label="Stockage utilisé"
          value={data.usage.total}
          max={data.usage.limit}
          style={{ width: '100%', accentColor: '#701d2d' }}
        />
        <div className={styles.stats}>
          {(
            [
              ['photos', 'Photos'],
              ['videos', 'Vidéos'],
              ['audio', 'Audio'],
              ['studio', 'Studio'],
            ] as const
          ).map(([key, label]) => (
            <span key={key}>
              {label} : {(data.usage[key] / 1000000).toFixed(1)} Mo
            </span>
          ))}
        </div>
        {data.usage.pending > 0 && (
          <p>
            {(data.usage.pending / 1000000).toFixed(1)} Mo réservés par des
            dépôts en attente.
          </p>
        )}
        {usage.level !== 'normal' && (
          <p role="status">
            {usage.level === 'full'
              ? 'Votre stockage est plein. Téléchargez puis supprimez des fichiers pour pouvoir en ajouter.'
              : `Votre stockage atteint ${usage.percent} %. Pensez à libérer de l’espace.`}
          </p>
        )}
      </section>
      <section
        className={`${styles.card} ${styles.exportCard}`}
        aria-labelledby="export-title"
      >
        <h2 id="export-title">Emportez vos souvenirs</h2>
        <p>
          Retrouvez les photos, vidéos, messages audio et fichiers du Studio
          dans une archive ZIP, avec vos invitations enregistrées, vos invités,
          leurs réponses et votre organisation. Les dépôts en cours seront
          disponibles dans un prochain export, une fois terminés.
        </p>
        <a className={styles.link} href={`/events/${id}/souvenirs/export`}>
          Télécharger mes souvenirs (.zip)
        </a>
        <p>
          Vos fichiers restent disponibles dans votre compte après le
          téléchargement.
        </p>
      </section>
      <Gallery eventId={id} items={data.items} />
    </div>
  );
}
