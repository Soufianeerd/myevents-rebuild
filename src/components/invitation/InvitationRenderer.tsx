'use client';
import { useState, type CSSProperties, type ReactNode } from 'react';
import Image from 'next/image';
import type { InvitationDocument } from '@/core/invitations/models';
import styles from './invitation.module.css';
export function InvitationRenderer({
  document,
  preview = false,
  rsvp,
}: {
  document: InvitationDocument;
  preview?: boolean;
  rsvp?: ReactNode;
}) {
  const [opened, setOpened] = useState(preview || document.opening === 'none');
  return (
    <div
      className={`${styles.invitation} ${styles[document.font]}`}
      style={{ background: document.background }}
    >
      {!opened ? (
        <section className={`${styles.opening} ${styles[document.opening]}`}>
          <p>Une invitation pour vous</p>
          <h1>{document.title}</h1>
          <button
            onClick={() => setOpened(true)}
            className={styles.seal}
            aria-label="Ouvrir l’invitation"
          >
            M
          </button>
          <button className={styles.skip} onClick={() => setOpened(true)}>
            Passer l’introduction
          </button>
        </section>
      ) : (
        <div className={styles.paper}>
          {document.sections
            .filter((s) => s.visible)
            .map((section) => {
              const style: CSSProperties = {
                background: section.style.background,
                color: section.style.color,
                textAlign: section.style.align,
                padding: section.style.padding,
                borderRadius: section.style.radius,
                '--section-font-size': `${section.style.fontSize}px`,
              } as CSSProperties;
              return (
                <section
                  key={section.id}
                  className={`${styles.section} ${styles[section.style.animation]}`}
                  style={style}
                >
                  {section.type === 'identity' ? (
                    <p className={styles.identity}>{section.title}</p>
                  ) : section.type === 'title' ? (
                    <h1>{section.title}</h1>
                  ) : section.title ? (
                    <h2>{section.title}</h2>
                  ) : null}
                  {section.text && (
                    <p className={styles.text}>{section.text}</p>
                  )}
                  {section.type === 'image' && section.image && (
                    <div className={styles.photo}>
                      <Image
                        src={section.image}
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
