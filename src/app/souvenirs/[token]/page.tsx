import { notFound } from 'next/navigation';
import { guestMedia } from '@/server/media/service';
import { UploadForm } from '@/components/media/UploadForm';
import styles from '@/app/(app)/events/[id]/workspace.module.css';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Vos souvenirs — MyEvents',
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) notFound();
  const data = await guestMedia(token);
  if (!data) notFound();
  return (
    <main className={styles.workspace} style={{ padding: '40px 24px' }}>
      <p>MyEvents · Des souvenirs pour toujours</p>
      <h1>{data.space.title}</h1>
      <div className={styles.card}>
        <UploadForm token={token} kind={data.space.kind} />
      </div>
      <p>
        {data.space.collaborative
          ? `La galerie partagée ouvre le ${new Date(data.space.availableAt).toLocaleString('fr-FR')}.`
          : 'Les souvenirs sont visibles uniquement par l’organisateur.'}
      </p>
      <div className={styles.grid}>
        {data.items.map((i) => (
          <article className={styles.card} key={i.id}>
            <h2>{i.name}</h2>
            {i.mime.startsWith('audio/') ? (
              <audio controls src={i.url} />
            ) : i.mime.startsWith('video/') ? (
              <video controls src={i.url} style={{ width: '100%' }} />
            ) : (
              <img src={i.url} alt={i.name} style={{ width: '100%' }} />
            )}
            <p>{i.author}</p>
            {i.download && <a href={i.download}>Télécharger</a>}
          </article>
        ))}
      </div>
    </main>
  );
}
