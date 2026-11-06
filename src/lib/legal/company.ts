/**
 * Publisher information shown on the legal pages.
 * Fields set to `null` are not yet provided by the owner: the pages display
 * an explicit "à compléter" marker instead of inventing a value.
 * Update these values (or the matching LEGAL_* environment variables) before
 * opening sales in production.
 */
export type LegalCompany = {
  tradeName: string;
  publisherName: string;
  legalStatus: string;
  siret: string | null;
  address: string | null;
  contactEmail: string | null;
  vatMention: string;
  publicationDirector: string;
  host: string;
  mediator: string | null;
};

const fromEnv = (name: string) => {
  const value = process.env[name]?.trim();
  return value ? value : null;
};

export function legalCompany(): LegalCompany {
  return {
    tradeName: 'MyEvents',
    publisherName: 'Soufiane El Rhadi',
    legalStatus: 'Entrepreneur individuel (micro-entreprise)',
    siret: fromEnv('LEGAL_SIRET'),
    address: fromEnv('LEGAL_ADDRESS'),
    contactEmail: fromEnv('LEGAL_CONTACT_EMAIL'),
    vatMention: 'TVA non applicable, art. 293 B du CGI',
    publicationDirector: 'Soufiane El Rhadi',
    host: 'Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com',
    mediator: fromEnv('LEGAL_MEDIATOR'),
  };
}

export const LEGAL_PLACEHOLDER = 'à compléter avant l’ouverture des ventes';
export const LEGAL_UPDATED_AT = '6 novembre 2026';
