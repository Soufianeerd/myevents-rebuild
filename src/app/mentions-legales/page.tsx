import type { Metadata } from 'next';
import Link from 'next/link';
import {
  LegalSection,
  Placeholder,
  PublicShell,
} from '@/components/public/PublicShell';
import {
  LEGAL_PLACEHOLDER,
  LEGAL_UPDATED_AT,
  legalCompany,
} from '@/lib/legal/company';

export const metadata: Metadata = {
  title: 'Mentions légales — MyEvents',
};

export default function LegalNoticePage() {
  const c = legalCompany();
  const value = (v: string | null) =>
    v ?? <Placeholder>{LEGAL_PLACEHOLDER}</Placeholder>;
  return (
    <PublicShell
      eyebrow="Informations légales"
      title="Mentions légales"
      intro={<p>Dernière mise à jour : {LEGAL_UPDATED_AT}.</p>}
    >
      <LegalSection title="Éditeur du service">
        <ul>
          <li>Nom commercial : {c.tradeName}</li>
          <li>Éditeur : {c.publisherName}</li>
          <li>Statut : {c.legalStatus}</li>
          <li>SIRET : {value(c.siret)}</li>
          <li>Adresse : {value(c.address)}</li>
          <li>Contact : {value(c.contactEmail)}</li>
          <li>{c.vatMention}</li>
          <li>Directeur de la publication : {c.publicationDirector}</li>
        </ul>
      </LegalSection>
      <LegalSection title="Hébergement">
        <p>Application hébergée par {c.host}.</p>
        <p>
          Base de données et fichiers stockés par Neon, dans la région
          européenne de Francfort (Allemagne).
        </p>
      </LegalSection>
      <LegalSection title="Propriété intellectuelle">
        <p>
          La marque, l’interface, les modèles et les textes de MyEvents sont
          protégés. Les photographies d’illustration sont utilisées selon leurs
          licences respectives. Les contenus que vous ajoutez (textes, photos,
          vidéos, messages audio) restent les vôtres ; vous nous autorisez
          uniquement à les héberger et à les afficher aux personnes que vous
          choisissez.
        </p>
      </LegalSection>
      <LegalSection title="Données personnelles">
        <p>
          Le traitement de vos données est décrit dans la{' '}
          <Link href="/confidentialite">politique de confidentialité</Link>.
        </p>
      </LegalSection>
    </PublicShell>
  );
}
