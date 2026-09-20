import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { InvitationCover } from '@/components/invitations/InvitationCover';
import { findInvitationDemo, invitationDemos } from '@/lib/invitations/demos';
import styles from '@/components/invitations/invitation.module.css';

export function generateStaticParams() {
  return invitationDemos.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const demo = findInvitationDemo((await params).slug);
  return {
    title: demo
      ? `${demo.name} — Démonstration MyEvents`
      : 'Modèle introuvable — MyEvents',
    robots: { index: false, follow: true },
  };
}
export default async function InvitationDemoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const demo = findInvitationDemo((await params).slug);
  if (!demo) notFound();
  return (
    <div className={styles.demo}>
      <header className={styles.bar}>
        <Link href="/#modeles">← Retour aux modèles</Link>
        <span>Démonstration · {demo.name}</span>
        <Link href="/events/new">Créer mon événement ↗</Link>
      </header>
      <main className={styles.demoBody}>
        <h1 className={styles.demoHeading}>{demo.name}</h1>
        <p className={styles.disclaimer}>
          Exemple d’invitation. Les noms, la date et le programme sont fictifs.
        </p>
        <InvitationCover demo={demo} eager />
        <details className={styles.opening}>
          <summary>Ouvrir l’invitation</summary>
          <div className={styles.inside}>
            <h2>Une journée avec vous</h2>
            <p>{demo.message}</p>
            <ol className={styles.program}>
              {demo.program.map(([time, title]) => (
                <li key={time}>
                  <time>{time}</time>
                  <span>{title}</span>
                </li>
              ))}
            </ol>
            <h2>Le rendez-vous</h2>
            <p>
              {demo.location}
              <br />
              {demo.date}
            </p>
            <p className={styles.note}>
              Ceci est un aperçu de design. La personnalisation, la publication
              et les réponses des invités sont encore en préparation. Aucune
              réponse n’est collectée ici.
            </p>
          </div>
        </details>
      </main>
    </div>
  );
}
