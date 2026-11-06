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
  title: 'Conditions générales de vente — MyEvents',
};

export default function TermsPage() {
  const c = legalCompany();
  const value = (v: string | null) =>
    v ?? <Placeholder>{LEGAL_PLACEHOLDER}</Placeholder>;
  return (
    <PublicShell
      eyebrow="Informations légales"
      title="Conditions générales de vente"
      intro={
        <p>
          Applicables à toute commande passée sur MyEvents à compter du{' '}
          {LEGAL_UPDATED_AT}.
        </p>
      }
    >
      <LegalSection title="1. Vendeur">
        <p>
          {c.tradeName} est un service édité par {c.publisherName},{' '}
          {c.legalStatus.toLowerCase()}, SIRET {value(c.siret)}, domicilié{' '}
          {value(c.address)}. Contact : {value(c.contactEmail)}.
        </p>
      </LegalSection>
      <LegalSection title="2. Services proposés">
        <p>
          MyEvents permet de créer gratuitement un compte et de préparer un
          événement. Les services payants sont vendus à l’unité ou en pack, pour
          un événement donné :
        </p>
        <ul>
          <li>
            invitation digitale publiée par lien, avec gestion des réponses
            (RSVP) ;
          </li>
          <li>livre d’or audio accessible par QR code ;</li>
          <li>espace photos et vidéos accessible par QR code ;</li>
          <li>éditeur de cartes de remerciement ;</li>
          <li>stockage supplémentaire au-delà des 3 Go inclus par compte.</li>
        </ul>
        <p>
          Le détail et le prix de chaque offre sont indiqués sur la page{' '}
          <Link href="/tarifs">Tarifs</Link> et rappelés avant le paiement. Les
          cartes imprimées font l’objet d’un devis distinct, accepté séparément.
        </p>
      </LegalSection>
      <LegalSection title="3. Prix et paiement">
        <p>
          Les prix sont indiqués en euros, nets ({c.vatMention}). Ils sont
          payables en une fois, au moment de la commande, par carte bancaire via
          notre prestataire de paiement Stripe. Aucune donnée bancaire n’est
          conservée par MyEvents.
        </p>
      </LegalSection>
      <LegalSection title="4. Accès aux services">
        <p>
          Les services achetés sont activés pour l’événement concerné dès la
          confirmation du paiement. Ils restent accessibles pendant la durée
          indiquée dans l’offre au moment de l’achat. Durée de conservation par
          défaut : <Placeholder>{LEGAL_PLACEHOLDER}</Placeholder>.
        </p>
      </LegalSection>
      <LegalSection title="5. Droit de rétractation">
        <p>
          Les services MyEvents sont des contenus et services numériques fournis
          immédiatement après le paiement. Conformément à l’article L221-28 du
          Code de la consommation, en demandant leur exécution immédiate et en
          reconnaissant perdre votre droit de rétractation lors de la commande,
          vous ne pouvez plus exercer ce droit une fois le service activé.
        </p>
        <p>
          Les cartes imprimées étant personnalisées, elles sont également
          exclues du droit de rétractation (article L221-28, 3°).
        </p>
      </LegalSection>
      <LegalSection title="6. Vos contenus">
        <p>
          Vous êtes responsable des contenus que vous publiez et des invités
          auxquels vous les partagez. Vous garantissez disposer des droits
          nécessaires sur les photos, vidéos, musiques et textes ajoutés.
          MyEvents peut retirer un contenu manifestement illicite qui lui est
          signalé.
        </p>
      </LegalSection>
      <LegalSection title="7. Disponibilité et responsabilité">
        <p>
          MyEvents met en œuvre les moyens raisonnables pour assurer l’accès au
          service, sans pouvoir garantir une disponibilité ininterrompue. Vous
          pouvez à tout moment exporter vos données depuis votre espace.
        </p>
      </LegalSection>
      <LegalSection title="8. Réclamations et médiation">
        <p>
          Pour toute réclamation, écrivez à {value(c.contactEmail)}. À défaut de
          solution amiable, vous pouvez saisir gratuitement le médiateur de la
          consommation : {value(c.mediator)}.
        </p>
      </LegalSection>
      <LegalSection title="9. Droit applicable">
        <p>
          Les présentes conditions sont soumises au droit français. Les règles
          protectrices du pays de résidence du consommateur restent applicables.
        </p>
      </LegalSection>
    </PublicShell>
  );
}
