import type { Metadata } from 'next';
import Link from 'next/link';
import {
  formatEuros,
  productLabels,
  testOffers,
} from '@/core/commerce/catalog';
import { ADDITIONAL_GB_CENTS } from '@/core/profile/models';
import { PublicShell } from '@/components/public/PublicShell';
import styles from '@/components/public/public.module.css';

export const metadata: Metadata = {
  title: 'Tarifs — MyEvents',
  description:
    'Invitation digitale, livre d’or audio, photos et vidéos : choisissez un service seul ou un pack, payé une fois par événement.',
};

const packIds = new Set([
  'invitation-audio',
  'invitation-souvenirs',
  'audio-photo-video',
  'experience-complete',
]);

export default function PricingPage() {
  const offers = testOffers.filter((offer) => offer.active);
  const single = offers.filter((offer) => !packIds.has(offer.id));
  const packs = offers.filter((offer) => packIds.has(offer.id));
  const card = (offer: (typeof offers)[number]) => (
    <li key={offer.id} className={styles.card}>
      {offer.id === 'experience-complete' ? (
        <span className={styles.badge}>Le plus complet</span>
      ) : null}
      <h3>{offer.name}</h3>
      <span className={styles.price}>{formatEuros(offer.amount)}</span>
      <p className={styles.includes}>
        {offer.products.map((p) => productLabels[p]).join(' + ')}
      </p>
    </li>
  );
  return (
    <PublicShell
      eyebrow="Tarifs"
      title="Un paiement unique par événement"
      intro={
        <p>
          Créer un compte et préparer votre invitation est gratuit. Vous ne
          payez que les services que vous publiez, une seule fois pour
          l’événement concerné. Prix nets, sans abonnement.
        </p>
      }
    >
      <section aria-labelledby="unite">
        <h2 id="unite" className={styles.eyebrow}>
          À l’unité
        </h2>
        <ul className={styles.grid}>{single.map(card)}</ul>
      </section>
      <section aria-labelledby="packs">
        <h2 id="packs" className={styles.eyebrow}>
          Packs
        </h2>
        <ul className={styles.grid}>{packs.map(card)}</ul>
      </section>
      <section aria-labelledby="stockage" className={styles.section}>
        <h2 id="stockage">Stockage des souvenirs</h2>
        <p>
          3 Go inclus pour votre compte, partagés entre vos événements. Au-delà
          : {formatEuros(ADDITIONAL_GB_CENTS)} par Go supplémentaire.
        </p>
      </section>
      <section aria-labelledby="impression" className={styles.section}>
        <h2 id="impression">Cartes imprimées</h2>
        <p>
          Les cartes physiques font l’objet d’un devis selon le matériau, le
          format, la quantité et la livraison. Le PDF de votre carte reste
          téléchargeable sans commande d’impression.
        </p>
      </section>
      <p>
        <Link href="/inscription" className={styles.cta}>
          Créer mon espace gratuitement
        </Link>
      </p>
      <p className={styles.note}>
        TVA non applicable, art. 293 B du CGI. Voir les{' '}
        <Link href="/cgv">conditions générales de vente</Link>.
      </p>
    </PublicShell>
  );
}
