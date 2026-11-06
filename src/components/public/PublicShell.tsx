import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './public.module.css';

export const legalLinks = [
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/mentions-legales', label: 'Mentions légales' },
  { href: '/cgv', label: 'Conditions de vente' },
  { href: '/confidentialite', label: 'Confidentialité' },
] as const;

export function PublicFooterLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Informations" className={className}>
      <ul className={styles.footerLinks}>
        {legalLinks.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PublicShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#contenu">
        Aller au contenu
      </a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="MyEvents, accueil">
          <span aria-hidden="true" className={styles.emblem}>
            ♡
          </span>
          MyEvents
        </Link>
        <nav aria-label="Principale" className={styles.nav}>
          <Link href="/#modeles">Modèles</Link>
          <Link href="/tarifs">Tarifs</Link>
          <Link href="/connexion">Mon espace</Link>
        </nav>
      </header>
      <main id="contenu" className={styles.main}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {intro ? <div className={styles.intro}>{intro}</div> : null}
        {children}
      </main>
      <footer className={styles.footer}>
        <p>© MyEvents · Des événements aujourd’hui, des souvenirs toujours.</p>
        <PublicFooterLinks />
      </footer>
    </div>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return <mark className={styles.placeholder}>{children}</mark>;
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
