'use client';
import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import type { InvitationDocument } from '@/core/invitations/models';
import styles from './invitation.module.css';
import { ExternalMusicPlayer } from './ExternalMusicPlayer';
import { CalendarBlock } from './CalendarBlock';
import { directionsUrl, withOpacity } from '@/core/invitations/presentation';
const fonts = {
  editorial: 'InvitationEditorial, Georgia, serif',
  script: 'InvitationScript, cursive',
  sans: 'Arial, sans-serif',
};
export function InvitationRenderer({
  document,
  preview = false,
  rsvp,
  mediaUrls = {},
}: {
  document: InvitationDocument;
  preview?: boolean;
  rsvp?: ReactNode;
  mediaUrls?: Record<string, string>;
}) {
  const [opened, setOpened] = useState(preview || document.opening === 'none');
  const audio = useRef<HTMLAudioElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [opening, setOpening] = useState(false);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  useEffect(() => {
    if (audio.current) audio.current.volume = document.music?.volume ?? 0.5;
  }, [document.music?.volume]);
  function open(skip = false) {
    if (audio.current && !preview) {
      audio.current.volume = document.music?.volume ?? 0.5;
      void audio.current.play().catch(() => undefined);
    }
    if (skip || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOpened(true);
      return;
    }
    setOpening(true);
    timer.current = setTimeout(
      () => setOpened(true),
      (document.openingStyle?.duration ?? 0.6) * 1000,
    );
  }
  const places = document.sections.filter(
    (section) => section.type === 'location' && section.visible,
  ).length;
  const background = document.backgroundMediaId
    ? mediaUrls[document.backgroundMediaId]
    : document.backgroundImage;
  return (
    <div
      className={styles.invitation}
      style={{
        background: document.background,
        fontFamily: fonts[document.font],
      }}
    >
      {document.music && mediaUrls[document.music.mediaId] && (
        <div className={styles.music} hidden={!opened}>
          <audio
            ref={audio}
            controls
            preload="none"
            src={mediaUrls[document.music.mediaId]}
            loop={document.music.loop}
            aria-label="Musique de l’invitation"
          />
        </div>
      )}
      {background && (
        <div
          className={styles.background}
          style={{ opacity: document.backgroundOpacity ?? 1 }}
        >
          <Image
            src={background}
            alt=""
            fill
            unoptimized={!!document.backgroundMediaId}
            sizes="100vw"
          />
        </div>
      )}
      {!opened ? (
        <section
          className={`${styles.opening} ${styles[document.opening]} ${opening ? styles.openingExit : ''}`}
          style={{
            backgroundColor: document.openingStyle?.background,
            color: document.openingStyle?.color,
            animationDuration: `${document.openingStyle?.duration ?? 0.6}s`,
          }}
        >
          <p>Une invitation pour vous</p>
          <h1>{document.title}</h1>
          <button
            onClick={() => open()}
            className={styles.seal}
            style={{ backgroundColor: document.openingStyle?.sealColor }}
            aria-label="Ouvrir l’invitation"
          >
            {document.openingStyle?.sealText || 'M'}
          </button>
          <button className={styles.skip} onClick={() => open(true)}>
            Passer l’introduction
          </button>
        </section>
      ) : (
        <div className={styles.paper}>
          {document.externalMusic && (
            <ExternalMusicPlayer
              key={`${document.externalMusic.provider}:${document.externalMusic.id}`}
              music={document.externalMusic}
            />
          )}
          {document.sections
            .filter((s) => s.visible)
            .map((section) => {
              const style: CSSProperties = {
                background: withOpacity(
                  section.style.background,
                  section.style.opacity ?? 1,
                ),
                color: section.style.color,
                textAlign: section.style.align,
                padding: section.style.padding,
                borderRadius: section.style.radius,
                border: `${section.style.borderWidth ?? 0}px solid ${section.style.borderColor ?? section.style.color}`,
                boxShadow:
                  section.style.shadow === 'strong'
                    ? '0 12px 32px #0003'
                    : section.style.shadow === 'soft'
                      ? '0 4px 14px #0002'
                      : undefined,
                fontWeight: section.style.fontWeight,
                fontFamily:
                  section.style.font && section.style.font !== 'inherit'
                    ? fonts[section.style.font]
                    : undefined,
                fontStyle: section.style.italic ? 'italic' : undefined,
                letterSpacing: section.style.letterSpacing,
                lineHeight: section.style.lineHeight,
                '--section-font-size': `${section.style.fontSize}px`,
                '--section-line-height': section.style.lineHeight,
              } as CSSProperties;
              return (
                <section
                  key={section.id}
                  className={`${styles.section} ${styles[section.style.animation] ?? ''}`}
                  style={style}
                >
                  {section.backgroundMediaId &&
                    mediaUrls[section.backgroundMediaId] && (
                      <div className={styles.background}>
                        <Image
                          src={mediaUrls[section.backgroundMediaId]}
                          alt=""
                          fill
                          unoptimized
                          sizes="700px"
                        />
                      </div>
                    )}
                  {section.type === 'identity' &&
                    (section.mediaId
                      ? mediaUrls[section.mediaId]
                      : section.image) && (
                      <div className={styles.logo}>
                        <Image
                          src={
                            section.mediaId
                              ? mediaUrls[section.mediaId]
                              : section.image
                          }
                          alt={section.title || 'Logo'}
                          width={160}
                          height={120}
                          unoptimized={!!section.mediaId}
                        />
                      </div>
                    )}
                  {section.type === 'location' && places > 2 ? (
                    <h2>
                      <a
                        href={directionsUrl(
                          section.text || section.title,
                          section.location?.navigation,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {section.title}
                      </a>
                    </h2>
                  ) : section.type === 'identity' ? (
                    <p className={styles.identity}>{section.title}</p>
                  ) : section.type === 'title' ? (
                    <h1>{section.title}</h1>
                  ) : section.title ? (
                    <h2>{section.title}</h2>
                  ) : null}
                  {section.text &&
                    !(section.type === 'location' && places > 2) && (
                      <p className={styles.text}>{section.text}</p>
                    )}
                  {section.type === 'image' &&
                    (section.mediaId
                      ? mediaUrls[section.mediaId]
                      : section.image) && (
                      <div className={styles.photo}>
                        <Image
                          src={
                            section.mediaId
                              ? mediaUrls[section.mediaId]
                              : section.image
                          }
                          unoptimized={!!section.mediaId}
                          alt={section.title || 'Photographie de l’invitation'}
                          fill
                          sizes="(max-width: 700px) 100vw, 650px"
                        />
                      </div>
                    )}
                  {section.type === 'program' && (
                    <ol className={styles.program}>
                      {section.items.map((item, index) => (
                        <li key={index}>
                          <time>{item.time}</time>
                          <div>
                            <strong>{item.title}</strong>
                            {item.description && <p>{item.description}</p>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                  {section.type === 'location' && (
                    <div className={styles.location}>
                      {section.location?.time && (
                        <p>
                          <time>{section.location.time}</time>
                        </p>
                      )}
                      {places <= 2 && (
                        <>
                          {section.mediaId && mediaUrls[section.mediaId] && (
                            <div className={styles.map}>
                              <Image
                                src={mediaUrls[section.mediaId]}
                                alt={`Aperçu cartographique : ${section.title}`}
                                width={650}
                                height={350}
                                unoptimized
                              />
                            </div>
                          )}
                          <a
                            href={directionsUrl(
                              section.text || section.title,
                              section.location?.navigation,
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Itinéraire{' '}
                            {section.location?.navigation === 'waze'
                              ? 'Waze'
                              : 'Google Maps'}
                          </a>
                        </>
                      )}
                    </div>
                  )}
                  {['calendar', 'countdown'].includes(section.type) && (
                    <CalendarBlock section={section} title={document.title} />
                  )}
                  {section.type === 'rsvp' && document.rsvpEnabled && rsvp}
                  {section.type === 'divider' && <hr />}
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
