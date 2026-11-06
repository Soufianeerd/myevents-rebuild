import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  getCurrentSafeUser,
  getCurrentAccessContext,
} from '@/server/auth/getCurrentAccessContext';
import { mediaRepository } from '@/server/media/service';
import { storageAlert } from '@/core/media/models';
import { ADDITIONAL_GB_CENTS } from '@/core/profile/models';
import { ProfileForm } from './ProfileForm';
import styles from '../events/[id]/workspace.module.css';
export const metadata = {
  title: 'Mon profil — MyEvents',
  robots: { index: false, follow: false },
};
export default async function ProfilePage() {
  const user = await getCurrentSafeUser(),
    context = await getCurrentAccessContext();
  if (!user || context.kind !== 'user') redirect('/connexion');
  const usage = await (await mediaRepository()).usage(context.tenantId),
    alert = storageAlert(usage);
  return (
    <div className={styles.workspace}>
      <Link href="/dashboard">← Mes événements</Link>
      <h1>Mon profil</h1>
      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Mes informations</h2>
          <ProfileForm user={user} />
          <Link href="/mot-de-passe-oublie">
            Modifier mon mot de passe par e-mail
          </Link>
        </section>
        <section className={styles.card}>
          <h2>Mon stockage</h2>
          <p>3 Go inclus pour votre compte, partagés entre vos événements.</p>
          <progress
            max={usage.limit}
            value={usage.total}
            aria-label="Stockage utilisé"
          />
          <p>
            {(usage.total / 1000000000).toFixed(2)} Go utilisés sur{' '}
            {(usage.limit / 1000000000).toFixed(2)} Go · {alert.percent} %
          </p>
          <p>
            {(ADDITIONAL_GB_CENTS / 100).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}{' '}
            par Go supplémentaire.
          </p>
          <p>
            Gérez les fichiers et les téléchargements depuis l’espace Souvenirs
            de chaque événement.
          </p>
          <Link href="/dashboard">Choisir un événement</Link>
        </section>
      </div>
      <p>
        <Link href="/facturation">Consulter mes achats</Link>
      </p>
    </div>
  );
}
