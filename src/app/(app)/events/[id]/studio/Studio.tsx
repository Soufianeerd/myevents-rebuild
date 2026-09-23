'use client';
import { useState, useRef, useEffect, type DragEvent } from 'react';
import Link from 'next/link';
import { ImageUpload } from '@/components/invitation/ImageUpload';
import {
  invitationDocumentSchema,
  sectionSchema,
  fieldKinds,
  type InvitationDocument,
  type InvitationSection,
  type InvitationRecord,
} from '@/core/invitations/models';
import { applyTemplate, templateOptions } from '@/core/invitations/templates';
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { RsvpForm } from '@/components/invitation/RsvpForm';
import {
  saveDocumentAction,
  publishDocumentAction,
  suspendDocumentAction,
} from './actions';
import styles from './studio.module.css';
const labels: Record<InvitationSection['type'], string> = {
  identity: 'Identité',
  title: 'Titre',
  message: 'Texte',
  image: 'Photo',
  program: 'Programme',
  location: 'Lieu',
  calendar: 'Date',
  rsvp: 'RSVP',
  divider: 'Séparateur',
};
export function Studio({
  eventId,
  initialAssets,
  initial,
  initialRevision,
  history,
  publicUrl,
  canPublish,
}: {
  eventId: string;
  initialAssets: Array<{ id: string; name: string; url: string }>;
  initial: InvitationDocument;
  initialRevision: number;
  history: InvitationRecord['history'];
  publicUrl: string | null;
  canPublish: boolean;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [document, setDocument] = useState(initial),
    [selected, setSelected] = useState(initial.sections[0].id),
    [status, setStatus] = useState(
      initialRevision ? 'Brouillon enregistré' : 'Nouveau brouillon',
    ),
    [error, setError] = useState(''),
    [url, setUrl] = useState(publicUrl),
    [busy, setBusy] = useState(false),
    [versions, setVersions] = useState(history),
    [width, setWidth] = useState(390),
    [undo, setUndo] = useState<InvitationDocument[]>([]),
    [redo, setRedo] = useState<InvitationDocument[]>([]);
  const current = useRef(initial),
    revision = useRef(initialRevision),
    dirty = useRef(initialRevision === 0),
    saving = useRef<Promise<boolean> | null>(null),
    dragged = useRef<string | null>(null);
  function change(next: InvitationDocument) {
    const previous = current.current;
    setUndo((old) => [...old, previous]);
    setRedo([]);
    current.current = next;
    dirty.current = true;
    setDocument(next);
    setStatus('Modifications non enregistrées');
    setError('');
  }
  function restore(next: InvitationDocument, direction: 'undo' | 'redo') {
    if (direction === 'undo') {
      setUndo((old) => old.slice(0, -1));
      setRedo((old) => [...old, document]);
    } else {
      setRedo((old) => old.slice(0, -1));
      setUndo((old) => [...old, document]);
    }
    current.current = next;
    dirty.current = true;
    setDocument(next);
  }
  async function persist() {
    if (saving.current) return saving.current;
    const task = (async () => {
      while (dirty.current) {
        const snapshot = current.current;
        const valid = invitationDocumentSchema.safeParse(snapshot);
        if (!valid.success) {
          setError(valid.error.issues[0]?.message ?? 'Vérifiez le document.');
          return false;
        }
        setStatus('Enregistrement…');
        try {
          const result = await saveDocumentAction(
            eventId,
            snapshot,
            revision.current,
          );
          if (!result.ok) {
            setError(result.error);
            setStatus('Non enregistré');
            return false;
          }
          revision.current = result.record.revision;
          setVersions(result.record.history);
          dirty.current = current.current !== snapshot;
        } catch {
          setError(
            'Connexion interrompue. Vos modifications restent dans cet écran.',
          );
          setStatus('Non enregistré');
          return false;
        }
      }
      setStatus('Brouillon enregistré');
      return true;
    })();
    saving.current = task;
    try {
      return await task;
    } finally {
      saving.current = null;
    }
  }
  const persistRef = useRef(persist);
  useEffect(() => {
    persistRef.current = persist;
  });
  useEffect(() => {
    const timer = setTimeout(() => void persistRef.current(), 1000);
    return () => clearTimeout(timer);
  }, [document]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const section =
    document.sections.find((s) => s.id === selected) ?? document.sections[0];
  function patchSection(patch: Partial<InvitationSection>) {
    change({
      ...current.current,
      sections: current.current.sections.map((s) =>
        s.id === section.id ? { ...s, ...patch } : s,
      ),
    });
  }
  function move(id: string, offset: number) {
    const list = [...document.sections],
      index = list.findIndex((s) => s.id === id),
      target = index + offset;
    if (index < 0 || target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    change({ ...document, sections: list });
  }
  function drop(e: DragEvent, id: string) {
    e.preventDefault();
    const from = document.sections.findIndex((s) => s.id === dragged.current),
      to = document.sections.findIndex((s) => s.id === id);
    if (from >= 0 && to >= 0) move(dragged.current!, to - from);
    dragged.current = null;
  }
  async function publish() {
    setBusy(true);
    setError('');
    try {
      if (!(await persist())) return;
      const result = await publishDocumentAction(eventId, revision.current);
      if (result.ok) {
        setUrl(result.url);
        setStatus('Invitation publiée');
      } else setError(result.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.studio}>
      <header className={styles.header}>
        <div>
          <Link href={`/events/${eventId}`}>← Mon événement</Link>
          <h1>Mon Studio</h1>
          <p role="status">{status}</p>
        </div>
        <div className={styles.actions}>
          <button
            disabled={!undo.length || busy}
            onClick={() => restore(undo[undo.length - 1], 'undo')}
          >
            Annuler
          </button>
          <button
            disabled={!redo.length || busy}
            onClick={() => restore(redo[redo.length - 1], 'redo')}
          >
            Rétablir
          </button>
          <button onClick={() => void persist()} disabled={busy}>
            Enregistrer
          </button>
          <button
            className={styles.primary}
            onClick={() => void publish()}
            disabled={busy || !canPublish}
          >
            {busy ? 'Publication…' : 'Publier'}
          </button>
        </div>
      </header>
      {!canPublish && (
        <p className={styles.notice}>
          Personnalisez votre brouillon librement.{' '}
          <Link href={`/events/${eventId}/offres`}>
            Activez le produit Invitation
          </Link>{' '}
          pour publier et recevoir des réponses.
        </p>
      )}
      {error && (
        <p role="alert" className={`${styles.notice} ${styles.error}`}>
          {error}
        </p>
      )}
      {url && (
        <div className={styles.share}>
          <span>Votre lien :</span>
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setStatus('Lien copié');
              } catch {
                setStatus('Sélectionnez le lien pour le copier.');
              }
            }}
          >
            Copier
          </button>
          <button
            onClick={async () => {
              const result = await suspendDocumentAction(eventId);
              if (result.ok) {
                setUrl(null);
                setStatus('Invitation suspendue');
              } else setError(result.error);
            }}
          >
            Suspendre le lien
          </button>
        </div>
      )}
      <div className={styles.layout}>
        <aside className={styles.panel} aria-label="Sections de l’invitation">
          <h2>Votre invitation</h2>
          <label>
            Nom du document
            <input
              value={document.title}
              maxLength={180}
              onChange={(e) => change({ ...document, title: e.target.value })}
            />
          </label>
          <label>
            Modèle
            <select
              value={document.theme}
              onChange={(e) =>
                change(
                  applyTemplate(
                    document,
                    e.target.value as InvitationDocument['theme'],
                  ),
                )
              }
            >
              {templateOptions.map((t) => (
                <option value={t.id} key={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <ol className={styles.sectionList}>
            {document.sections.map((s, index) => (
              <li
                key={s.id}
                className={styles.sectionItem}
                data-selected={section.id === s.id}
                draggable
                onDragStart={() => {
                  dragged.current = s.id;
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => drop(e, s.id)}
              >
                <button
                  onClick={() => setSelected(s.id)}
                  aria-pressed={section.id === s.id}
                >
                  {labels[s.type]}
                  {!s.visible ? ' (masqué)' : ''}
                </button>
                <div className={styles.sectionTools}>
                  <button
                    aria-label={`Monter ${labels[s.type]} ${index + 1}`}
                    disabled={index === 0}
                    onClick={() => move(s.id, -1)}
                  >
                    ↑
                  </button>
                  <button
                    aria-label={`Descendre ${labels[s.type]} ${index + 1}`}
                    disabled={index === document.sections.length - 1}
                    onClick={() => move(s.id, 1)}
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <label>
            Ajouter une section
            <select
              value=""
              onChange={(e) => {
                if (!e.target.value) return;
                const next = sectionSchema.parse({
                  id: crypto.randomUUID(),
                  type: e.target.value,
                  title: labels[e.target.value as InvitationSection['type']],
                });
                change({ ...document, sections: [...document.sections, next] });
                setSelected(next.id);
              }}
            >
              <option value="">Choisir un bloc…</option>
              {Object.entries(labels)
                .filter(
                  ([type]) =>
                    type !== 'rsvp' ||
                    !document.sections.some((s) => s.type === 'rsvp'),
                )
                .map(([type, name]) => (
                  <option key={type} value={type}>
                    {name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Restaurer une version
            <select
              value=""
              onChange={(e) => {
                const version = versions.find(
                  (v) => v.revision === Number(e.target.value),
                );
                if (version) change(version.document);
              }}
            >
              <option value="">Historique ({versions.length})</option>
              {[...versions].reverse().map((v) => (
                <option key={v.revision} value={v.revision}>
                  Version {v.revision} —{' '}
                  {new Date(v.createdAt).toLocaleString('fr-FR')}
                </option>
              ))}
            </select>
          </label>
        </aside>
        <div>
          <div className={styles.actions} style={{ marginBottom: 12 }}>
            {[
              [390, 'Mobile'],
              [768, 'Tablette'],
              [1100, 'Ordinateur'],
            ].map(([size, label]) => (
              <button
                key={size}
                aria-pressed={width === size}
                onClick={() => setWidth(Number(size))}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.preview}>
            <div
              className={styles.viewport}
              style={{ width, maxWidth: '100%' }}
            >
              <InvitationRenderer
                mediaUrls={Object.fromEntries(
                  assets.map((asset) => [asset.id, asset.url]),
                )}
                document={document}
                preview
                rsvp={<RsvpForm document={document} preview />}
              />
            </div>
          </div>
        </div>
        <aside className={styles.properties} aria-label="Personnalisation">
          <div className={styles.panel}>
            <h2>{labels[section.type]}</h2>
            <label>
              <span>Afficher cette section</span>
              <input
                type="checkbox"
                checked={section.visible}
                onChange={(e) => patchSection({ visible: e.target.checked })}
              />
            </label>
            <label>
              Titre
              <input
                value={section.title}
                maxLength={180}
                onChange={(e) => patchSection({ title: e.target.value })}
              />
            </label>
            <label>
              Texte
              <textarea
                value={section.text}
                maxLength={4000}
                onChange={(e) => patchSection({ text: e.target.value })}
              />
            </label>
            {section.type === 'image' && (
              <div>
                <label>
                  Photographie
                  <select
                    value={
                      section.mediaId
                        ? `asset:${section.mediaId}`
                        : section.image
                    }
                    onChange={(e) =>
                      patchSection({
                        image: e.target.value.startsWith('asset:')
                          ? ''
                          : (e.target.value as InvitationSection['image']),
                        mediaId: e.target.value.startsWith('asset:')
                          ? e.target.value.slice(6)
                          : undefined,
                      })
                    }
                  >
                    <option value="">Aucune</option>
                    <option value="/images/editorial/jardin.jpg">
                      Jardin fleuri
                    </option>
                    <option value="/images/editorial/reception.jpg">
                      Réception au jardin
                    </option>
                    <option value="/images/editorial/anniversaire.jpg">
                      Anniversaire
                    </option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={`asset:${asset.id}`}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </label>
                <ImageUpload
                  key={section.id}
                  eventId={eventId}
                  onUploaded={(asset) => {
                    setAssets((previous) => [...previous, asset]);
                    patchSection({ mediaId: asset.id, image: '' });
                  }}
                />
              </div>
            )}
            {section.type === 'program' && (
              <div>
                <h3>Moments de la journée</h3>
                {section.items.map((item, index) => (
                  <div key={index} className={styles.formFields}>
                    <label>
                      Heure
                      <input
                        value={item.time}
                        maxLength={30}
                        onChange={(e) =>
                          patchSection({
                            items: section.items.map((v, i) =>
                              i === index ? { ...v, time: e.target.value } : v,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Intitulé
                      <input
                        value={item.title}
                        maxLength={180}
                        onChange={(e) =>
                          patchSection({
                            items: section.items.map((v, i) =>
                              i === index ? { ...v, title: e.target.value } : v,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Description
                      <input
                        value={item.description}
                        maxLength={500}
                        onChange={(e) =>
                          patchSection({
                            items: section.items.map((v, i) =>
                              i === index
                                ? { ...v, description: e.target.value }
                                : v,
                            ),
                          })
                        }
                      />
                    </label>
                    <button
                      onClick={() =>
                        patchSection({
                          items: section.items.filter((_, i) => i !== index),
                        })
                      }
                    >
                      Retirer ce moment
                    </button>
                  </div>
                ))}
                <button
                  disabled={section.items.length >= 30}
                  onClick={() =>
                    patchSection({
                      items: [
                        ...section.items,
                        {
                          time: '18:00',
                          title: 'Nouveau moment',
                          description: '',
                        },
                      ],
                    })
                  }
                >
                  Ajouter un moment
                </button>
              </div>
            )}
            <label>
              Couleur du texte
              <input
                type="color"
                value={section.style.color}
                onChange={(e) =>
                  patchSection({
                    style: { ...section.style, color: e.target.value },
                  })
                }
              />
            </label>
            <label>
              Fond de la section
              <input
                type="color"
                value={section.style.background}
                onChange={(e) =>
                  patchSection({
                    style: { ...section.style, background: e.target.value },
                  })
                }
              />
            </label>
            <label>
              Alignement
              <select
                value={section.style.align}
                onChange={(e) =>
                  patchSection({
                    style: {
                      ...section.style,
                      align: e.target.value as 'left' | 'center' | 'right',
                    },
                  })
                }
              >
                <option value="left">Gauche</option>
                <option value="center">Centré</option>
                <option value="right">Droite</option>
              </select>
            </label>
            <label>
              Taille du titre
              <input
                type="range"
                min={14}
                max={80}
                value={section.style.fontSize}
                onChange={(e) =>
                  patchSection({
                    style: {
                      ...section.style,
                      fontSize: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label>
              Espacement
              <input
                type="range"
                min={8}
                max={96}
                value={section.style.padding}
                onChange={(e) =>
                  patchSection({
                    style: {
                      ...section.style,
                      padding: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
            <label>
              Animation
              <select
                value={section.style.animation}
                onChange={(e) =>
                  patchSection({
                    style: {
                      ...section.style,
                      animation: e.target.value as 'none' | 'reveal' | 'zoom',
                    },
                  })
                }
              >
                <option value="none">Aucune</option>
                <option value="reveal">Apparition douce</option>
                <option value="zoom">Zoom discret</option>
              </select>
            </label>
            <button
              disabled={document.sections.length <= 1}
              onClick={() => {
                const sections = document.sections.filter(
                  (s) => s.id !== section.id,
                );
                change({ ...document, sections });
                setSelected(sections[0].id);
              }}
            >
              Supprimer cette section
            </button>
            <h3>Style général</h3>
            <label>
              Fond général
              <input
                type="color"
                value={document.background}
                onChange={(e) =>
                  change({ ...document, background: e.target.value })
                }
              />
            </label>
            <label>
              Typographie
              <select
                value={document.font}
                onChange={(e) =>
                  change({
                    ...document,
                    font: e.target.value as InvitationDocument['font'],
                  })
                }
              >
                <option value="editorial">Éditoriale</option>
                <option value="script">Manuscrite</option>
                <option value="sans">Contemporaine</option>
              </select>
            </label>
            <label>
              Ouverture
              <select
                value={document.opening}
                onChange={(e) =>
                  change({
                    ...document,
                    opening: e.target.value as InvitationDocument['opening'],
                  })
                }
              >
                <option value="none">Directe</option>
                <option value="envelope">Enveloppe</option>
                <option value="curtains">Rideaux</option>
              </select>
            </label>
            <h3>Réponses des invités</h3>
            <label>
              Activer le RSVP
              <input
                type="checkbox"
                checked={document.rsvpEnabled}
                onChange={(e) =>
                  change({ ...document, rsvpEnabled: e.target.checked })
                }
              />
            </label>
            {document.fields.map((field, index) => (
              <div className={styles.formFields} key={field.id}>
                <label>
                  Libellé du champ {index + 1}
                  <input
                    value={field.label}
                    maxLength={100}
                    onChange={(e) =>
                      change({
                        ...document,
                        fields: document.fields.map((f, i) =>
                          i === index ? { ...f, label: e.target.value } : f,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Type
                  <select
                    value={field.type}
                    onChange={(e) =>
                      change({
                        ...document,
                        fields: document.fields.map((f, i) =>
                          i === index
                            ? {
                                ...f,
                                type: e.target.value as typeof field.type,
                                options: ['choice', 'multiple'].includes(
                                  e.target.value,
                                )
                                  ? ['Choix 1', 'Choix 2']
                                  : [],
                              }
                            : f,
                        ),
                      })
                    }
                  >
                    {fieldKinds.map((type) => (
                      <option key={type} value={type}>
                        {
                          {
                            text: 'Texte',
                            number: 'Nombre',
                            email: 'E-mail',
                            tel: 'Téléphone',
                            choice: 'Choix unique',
                            multiple: 'Choix multiples',
                            boolean: 'Oui / Non',
                            date: 'Date',
                            textarea: 'Texte long',
                          }[type]
                        }
                      </option>
                    ))}
                  </select>
                </label>
                {['choice', 'multiple'].includes(field.type) && (
                  <label>
                    Choix (un par ligne)
                    <textarea
                      value={field.options.join('\n')}
                      onChange={(e) =>
                        change({
                          ...document,
                          fields: document.fields.map((f, i) =>
                            i === index
                              ? { ...f, options: e.target.value.split('\n') }
                              : f,
                          ),
                        })
                      }
                    />
                  </label>
                )}
                <label>
                  Obligatoire
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      change({
                        ...document,
                        fields: document.fields.map((f, i) =>
                          i === index
                            ? { ...f, required: e.target.checked }
                            : f,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  onClick={() =>
                    change({
                      ...document,
                      fields: document.fields.filter((_, i) => i !== index),
                    })
                  }
                >
                  Retirer le champ
                </button>
              </div>
            ))}
            <button
              disabled={document.fields.length >= 30}
              onClick={() =>
                change({
                  ...document,
                  fields: [
                    ...document.fields,
                    {
                      id: `field_${crypto.randomUUID().slice(0, 8)}`,
                      label: 'Votre préférence',
                      type: 'text',
                      required: false,
                      description: '',
                      options: [],
                    },
                  ],
                })
              }
            >
              Ajouter une question RSVP
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
