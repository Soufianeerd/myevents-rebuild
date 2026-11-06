import type { Metadata } from 'next';
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
  title: 'Politique de confidentialité — MyEvents',
};

export default function PrivacyPage() {
  const c = legalCompany();
  const value = (v: string | null) =>
    v ?? <Placeholder>{LEGAL_PLACEHOLDER}</Placeholder>;
  return (
    <PublicShell
      eyebrow="Informations légales"
      title="Politique de confidentialité"
      intro={<p>Dernière mise à jour : {LEGAL_UPDATED_AT}.</p>}
    >
      <LegalSection title="Responsable du traitement">
        <p>
          {c.publisherName} ({c.tradeName}), contact : {value(c.contactEmail)}.
        </p>
      </LegalSection>
      <LegalSection title="Données traitées et finalités">
        <h3>Organisateurs</h3>
        <p>
          Adresse e-mail, nom, prénom, événements, contenus de l’invitation,
          commandes. Finalité : fournir le service et gérer les achats (base
          légale : exécution du contrat ; facturation : obligation légale).
        </p>
        <h3>Invités</h3>
        <p>
          Données saisies par l’organisateur ou par l’invité lors de sa réponse
          (nom, coordonnées, réponse, accompagnants, informations demandées par
          l’organisateur), messages audio, photos et vidéos déposés. Ces données
          sont traitées pour le compte de l’organisateur, qui décide de leur
          usage et de leur partage.
        </p>
        <h3>Sécurité</h3>
        <p>
          Journaux techniques limités, nécessaires à la sécurité du compte et à
          la prévention des abus (intérêt légitime).
        </p>
      </LegalSection>
      <LegalSection title="Destinataires et sous-traitants">
        <ul>
          <li>Vercel : hébergement de l’application ;</li>
          <li>
            Neon : base de données, authentification et stockage des fichiers,
            région de Francfort (UE) ;
          </li>
          <li>Stripe : paiement en ligne.</li>
        </ul>
        <p>
          Certains prestataires peuvent traiter des données hors de l’Union
          européenne ; ces transferts sont encadrés par les mécanismes prévus
          par le RGPD (décision d’adéquation ou clauses contractuelles types).
          Aucune donnée n’est vendue ni utilisée à des fins publicitaires.
        </p>
      </LegalSection>
      <LegalSection title="Durées de conservation">
        <ul>
          <li>Compte et événements : jusqu’à la suppression du compte ;</li>
          <li>Pièces comptables : 10 ans (obligation légale) ;</li>
          <li>
            Souvenirs (audio, photos, vidéos) :{' '}
            <Placeholder>{LEGAL_PLACEHOLDER}</Placeholder>.
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="Cookies">
        <p>
          MyEvents utilise uniquement les cookies nécessaires à la connexion et
          à la sécurité. Aucun cookie publicitaire ou de mesure d’audience
          tierce n’est déposé.
        </p>
      </LegalSection>
      <LegalSection title="Vos droits">
        <p>
          Vous disposez d’un droit d’accès, de rectification, d’effacement, de
          limitation, d’opposition et de portabilité. Depuis votre espace, vous
          pouvez exporter vos données au format ZIP. Pour toute demande, écrivez
          à {value(c.contactEmail)}. Vous pouvez également saisir la CNIL
          (cnil.fr).
        </p>
      </LegalSection>
    </PublicShell>
  );
}
