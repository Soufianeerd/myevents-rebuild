import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { InvitationCover } from '@/components/invitations/InvitationCover';
import { invitationDemos } from '@/lib/invitations/demos';
import styles from './home.module.css';

export const metadata: Metadata = {
  title: 'MyEvents — Chaque histoire mérite son événement',
  description:
    'Un espace pour vos événements. Préparez votre mariage, henné, anniversaire, baby shower ou événement professionnel avec MyEvents.',
};

const occasions = [
  'Mariage',
  'Henné',
  'Anniversaire',
  'Baby shower',
  'Événement professionnel',
  'Et tous les autres',
];
const steps = [
  ['Créez', 'Un compte, tous vos événements.'],
  ['Personnalisez', 'Une invitation qui vous ressemble.'],
  ['Partagez', 'Un lien à envoyer à vos proches.'],
  ['Retrouvez', 'Les réponses et les souvenirs réunis.'],
];

function Brand() {
  return (
    <span className={styles.brand}>
      <span aria-hidden="true" className={styles.emblem}>
        ♡
      </span>
      <span>
        MyEvents
        <small>
          Vos plus beaux moments
          <br />
          ont une plus belle histoire
        </small>
      </span>
    </span>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#contenu">
        Aller au contenu
      </a>
      <header className={styles.header}>
        <Link href="/" aria-label="MyEvents, accueil">
          <Brand />
        </Link>
        <nav aria-label="Navigation principale" className={styles.nav}>
          <a href="#evenements">Événements</a>
          <a href="#modeles">Les modèles</a>
          <a href="#questions">Vos questions</a>
        </nav>
        <Link href="/connexion" className={styles.secondary}>
          Se connecter
        </Link>
      </header>
      <main id="contenu">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              Une plateforme. Tous vos événements.
            </p>
            <h1 id="hero-title">
              Célébrez chaque
              <br />
              <em>histoire qui compte.</em>
            </h1>
            <p className={styles.intro}>
              Des premiers préparatifs aux souvenirs que l’on garde, donnez une
              place à chacun de vos plus beaux moments.
            </p>
            <div className={styles.actions}>
              <Link href="/events/new" className={styles.primary}>
                Créer mon événement <span aria-hidden="true">↗</span>
              </Link>
              <a href="#modeles" className={styles.secondary}>
                Découvrir les modèles
              </a>
            </div>
            <p className={styles.previewNote}>
              <span>Version de préparation</span> La création de compte et la
              gestion des événements sont disponibles. Invitations, RSVP et
              souvenirs sont en cours de développement.
            </p>
          </div>
          <div className={styles.heroScene}>
            <div className={styles.heroPhoto}>
              <Image
                src="/images/editorial/jardin.jpg"
                alt="Fleurs blanches et feuillage autour d’une table de cérémonie en plein air"
                fill
                sizes="(max-width: 700px) 90vw, 48vw"
                preload
              />
            </div>
            <Link
              href="/modeles/jardin-lumiere"
              className={styles.heroCard}
              aria-label="Ouvrir le modèle Jardin lumière"
            >
              <InvitationCover demo={invitationDemos[0]} eager />
              <span className={styles.cardLink}>
                Ouvrir l’invitation <span aria-hidden="true">↗</span>
              </span>
            </Link>
            <span className={styles.sceneNote}>
              Le début d’une
              <br />
              belle histoire.
            </span>
            <span className={styles.sceneCaption}>
              JARDIN LUMIÈRE — COLLECTION MYEVENTS
            </span>
          </div>
        </section>
        <section
          id="evenements"
          className={styles.occasions}
          aria-labelledby="occasions-title"
        >
          <h2 id="occasions-title" className={styles.eyebrow}>
            Tous vos moments de vie, au même endroit
          </h2>
          <ul>
            {occasions.map((name, index) => (
              <li key={name}>
                <span aria-hidden="true">
                  {['♡', '✧', '✺', '☼', '◇', '∞'][index]}
                </span>
                {name}
              </li>
            ))}
          </ul>
        </section>
        <section
          id="modeles"
          className={styles.collection}
          aria-labelledby="collection-title"
        >
          <div className={styles.collectionHeading}>
            <div>
              <p className={styles.eyebrow}>La collection · premiers regards</p>
              <h2 id="collection-title">
                À chaque histoire,
                <br />
                <em>sa façon de se raconter.</em>
              </h2>
            </div>
            <p>
              Du jardin ensoleillé à la fête de famille.
              <br />
              Ouvrez une invitation et découvrez son univers.
            </p>
          </div>
          <div className={styles.modelGrid}>
            {invitationDemos.map((demo, index) => (
              <article key={demo.slug} className={styles.model}>
                <Link
                  href={`/modeles/${demo.slug}`}
                  aria-label={`Découvrir le modèle ${demo.name}`}
                  className={styles.modelPreview}
                >
                  <InvitationCover demo={demo} />
                  <span className={styles.modelOpen}>
                    Ouvrir la démonstration ↗
                  </span>
                </Link>
                <div className={styles.modelMeta}>
                  <span>
                    0{index + 1} / {demo.category}
                  </span>
                  <span>Aperçu interactif</span>
                </div>
                <h3>{demo.name}</h3>
                <p>{demo.description}</p>
              </article>
            ))}
          </div>
          <p className={styles.collectionNote}>
            Trois démonstrations à explorer librement. La personnalisation et la
            publication seront disponibles dans une prochaine étape.
          </p>
        </section>
        <section
          className={styles.editorialStory}
          aria-labelledby="story-title"
        >
          <div className={styles.storyPhoto}>
            <Image
              src="/images/editorial/reception.jpg"
              alt="Une réception au jardin, des roses rouges et des bougies sur une table en bois"
              fill
              sizes="(max-width: 700px) 100vw, 50vw"
            />
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>
              Ce qui compte, c’est de se retrouver
            </p>
            <h2 id="story-title">
              Une grande table.
              <br />
              Vos personnes préférées.
              <br />
              <em>Et le temps qui s’arrête.</em>
            </h2>
            <p>
              Il y a les détails que l’on prépare pendant des mois. Et les
              moments qui ne se prévoient pas. MyEvents se construit autour des
              deux : vous aider à organiser, inviter, puis garder une trace de
              ce que vous avez vécu ensemble.
            </p>
            <a href="#experience">
              Découvrir l’expérience <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <section
          id="experience"
          className={styles.experience}
          aria-labelledby="experience-title"
        >
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>L’esprit MyEvents</p>
            <h2 id="experience-title">
              De l’invitation aux souvenirs,
              <br />
              <em>tout simplement.</em>
            </h2>
            <p>
              Nous construisons une expérience qui relie chaque étape de votre
              événement. Commencez aujourd’hui par créer votre espace et
              préparer vos événements.
            </p>
          </div>
          <ol className={styles.steps}>
            {steps.map(([title, text], index) => (
              <li key={title}>
                <span className={styles.stepNumber}>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                {index > 0 && <small>En préparation</small>}
              </li>
            ))}
          </ol>
          <div className={styles.promise}>
            <span aria-hidden="true">♡</span>
            <p>
              Votre invitation sera <strong>un lien à partager.</strong>
              <br />
              Les QR codes accompagneront vos espaces photo, vidéo et audio.
            </p>
          </div>
        </section>
        <section
          id="questions"
          className={styles.faq}
          aria-labelledby="questions-title"
        >
          <div>
            <p className={styles.eyebrow}>Avant de commencer</p>
            <h2 id="questions-title">
              Quelques réponses,
              <br />
              <em>en toute simplicité.</em>
            </h2>
          </div>
          <div className={styles.questions}>
            <details>
              <summary>Que puis-je faire dès maintenant ?</summary>
              <p>
                Créer votre compte, puis créer, consulter, modifier et supprimer
                vos événements dans votre espace. Les invitations, le Studio et
                le RSVP seront ajoutés au fur et à mesure de leur validation.
              </p>
            </details>
            <details>
              <summary>MyEvents est-il réservé aux mariages ?</summary>
              <p>
                Non. Un seul compte peut accueillir plusieurs événements :
                mariage, henné, anniversaire, baby shower, événement
                professionnel et bien d’autres moments.
              </p>
            </details>
            <details>
              <summary>Comment accéder à mes événements existants ?</summary>
              <p>
                Connectez-vous depuis « Se connecter ». Si vous reprenez un
                ancien compte, confirmez votre adresse e-mail : son rattachement
                doit ensuite être finalisé avant de retrouver vos événements.
              </p>
            </details>
            <details>
              <summary>Puis-je déjà acheter une offre ?</summary>
              <p>
                Les offres et le paiement ne sont pas encore ouverts. Aucun
                achat n’est proposé dans cette version de préparation.
              </p>
            </details>
          </div>
        </section>
        <section className={styles.closing} aria-labelledby="closing-title">
          <p className={styles.eyebrow}>Votre prochaine belle histoire</p>
          <h2 id="closing-title">Et si c’était votre tour ?</h2>
          <p>
            Un mariage, un anniversaire, une occasion de se retrouver.
            <br />
            Commencez par lui donner une place.
          </p>
          <Link href="/events/new" className={styles.primary}>
            Créer mon événement <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
      <footer className={styles.footer}>
        <Brand />
        <p>
          Des événements aujourd’hui.
          <br />
          Des souvenirs toujours.
        </p>
        <Link href="/connexion">
          Mon espace <span aria-hidden="true">↗</span>
        </Link>
      </footer>
    </div>
  );
}
