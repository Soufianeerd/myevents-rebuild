'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  type Design,
  type DesignElement,
  designElementSchema,
} from '@/core/designs/models';
import { DesignCanvas } from '@/components/designs/DesignCanvas';
import { saveDesignAction } from './actions';
import styles from '../workspace.module.css';
import { PrintOrderForm } from './PrintOrderForm';
import type { PrintMaterial } from '@/core/designs/printing';
import editor from './cards.module.css';
import { MaterialRequestForm } from './MaterialRequestForm';
import type { MaterialRequest } from '@/core/designs/requests';
import type { PrintStage } from '@/core/admin/models';
import { ImageUpload } from '@/components/invitation/ImageUpload';
type Initial = {
  document: Design;
  revision: number;
  products: string[];
  assets: Record<string, string>;
  imageChoices: { id: string; name: string }[];
  requests: MaterialRequest[];
  requestStages: Record<string, { stage: PrintStage; note: string }>;
  invitationTheme: {
    background: string;
    font: DesignElement['font'];
    color: string;
  } | null;
};
export function CardEditor({
  eventId,
  initial,
  materials,
  paymentAvailable,
}: {
  eventId: string;
  initial: Initial;
  materials: PrintMaterial[];
  paymentAvailable: boolean;
}) {
  const [document, setDocument] = useState(initial.document);
  const [assets, setAssets] = useState(initial.assets);
  const [imageChoices, setImageChoices] = useState(initial.imageChoices);
  const [revision, setRevision] = useState(initial.revision);
  const [side, setSide] = useState(0);
  const [selected, setSelected] = useState<string | undefined>(
    initial.document.sides[0].elements[0]?.id,
  );
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);
  const element = document.sides[side].elements.find((e) => e.id === selected);
  function change(next: Design) {
    setDocument(next);
    setDirty(true);
  }
  function patch(value: Partial<DesignElement>) {
    change({
      ...document,
      sides: document.sides.map((s, i) =>
        i === side
          ? {
              ...s,
              elements: s.elements.map((e) =>
                e.id === selected ? { ...e, ...value } : e,
              ),
            }
          : s,
      ),
    });
  }
  function add(
    type: DesignElement['type'],
    qr: DesignElement['qr'] = 'photo_video',
  ) {
    const item = designElementSchema.parse({
      id: crypto.randomUUID(),
      type,
      x: type === 'qr' ? 36 : 10,
      y: type === 'qr' ? 77 : 10,
      width: type === 'qr' ? 28 : 80,
      height: 20,
      text: type === 'text' ? 'Votre message' : '',
      qr,
    });
    change({
      ...document,
      sides: document.sides.map((s, i) =>
        i === side ? { ...s, elements: [...s.elements, item] } : s,
      ),
    });
    setSelected(item.id);
  }
  async function save() {
    setBusy(true);
    try {
      const result = await saveDesignAction(eventId, document, revision);
      if (result.ok) {
        setRevision(result.record.revision);
        setDirty(false);
        setStatus('Carte enregistrée.');
      } else setStatus(result.error);
    } catch {
      setStatus(
        'Connexion interrompue. Réessayez pour enregistrer votre carte.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function download() {
    setBusy(true);
    setStatus('Préparation du PDF…');
    try {
      const response = await fetch(
        `/events/${eventId}/cartes/pdf?revision=${revision}`,
      );
      if (!response.ok) throw new Error(await response.text());
      const url = URL.createObjectURL(await response.blob());
      const link = window.document.createElement('a');
      link.href = url;
      link.download = 'myevents-remerciement.pdf';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(
        'PDF téléchargé. Vous pouvez le faire imprimer où vous le souhaitez.',
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Téléchargement impossible.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`${styles.workspace} ${editor.editor}`}>
      <Link href={`/events/${eventId}`}>← Mon événement</Link>
      <header className={editor.header}>
        <div>
          <p>DES MOTS SIMPLES, POUR DE GRANDS MOMENTS</p>
          <h1>Cartes de remerciement</h1>
        </div>
        <button disabled={busy} onClick={() => void save()}>
          {busy ? 'Enregistrement…' : 'Enregistrer ma carte'}
        </button>
      </header>
      <p role="status">
        {status ||
          (dirty
            ? 'Modifications à enregistrer'
            : 'Votre création personnelle')}
      </p>
      <div className={editor.layout}>
        <aside className={styles.card} aria-label="Composition de la carte">
          <h2>Votre création</h2>
          <label>
            Nom de la carte
            <input
              disabled={busy}
              value={document.name}
              maxLength={180}
              onChange={(e) => change({ ...document, name: e.target.value })}
            />
          </label>
          <label>
            Format
            <select
              disabled={busy}
              value={`${document.widthMm}x${document.heightMm}`}
              onChange={(e) => {
                const [widthMm, heightMm] = e.target.value
                  .split('x')
                  .map(Number);
                change({ ...document, widthMm, heightMm });
              }}
            >
              <option value="105x148">A6 · 105 × 148 mm</option>
              <option value="148x105">A6 paysage · 148 × 105 mm</option>
              <option value="140x140">Carré · 140 × 140 mm</option>
            </select>
          </label>
          <label>
            Fond de cette face
            <input
              type="color"
              disabled={busy}
              value={document.sides[side].background}
              onChange={(e) =>
                change({
                  ...document,
                  sides: document.sides.map((s, i) =>
                    i === side ? { ...s, background: e.target.value } : s,
                  ),
                })
              }
            />
          </label>
          <h2>Ajouter</h2>
          {initial.invitationTheme && (
            <p>
              <button
                disabled={busy}
                onClick={() => {
                  const theme = initial.invitationTheme!;
                  change({
                    ...document,
                    sides: document.sides.map((face) => ({
                      ...face,
                      background: theme.background,
                      elements: face.elements.map((element) =>
                        element.type === 'text'
                          ? { ...element, font: theme.font, color: theme.color }
                          : element,
                      ),
                    })),
                  });
                }}
              >
                Reprendre le thème de mon invitation
              </button>
            </p>
          )}
          {(['text', 'image', 'shape'] as const).map((type, i) => (
            <p key={type}>
              <button disabled={busy} onClick={() => add(type)}>
                {['Texte', 'Photo ou logo', 'Forme'][i]}
              </button>
            </p>
          ))}
          {(['photo_video', 'audio'] as const).map((kind) => (
            <p key={kind}>
              <button
                disabled={busy || !initial.products.includes(kind)}
                onClick={() => add('qr', kind)}
              >
                QR {kind === 'audio' ? 'Audio' : 'Photo / Vidéo'}
              </button>
            </p>
          ))}
          <p>Les QR utilisent les options achetées pour cet événement.</p>
          <ImageUpload
            eventId={eventId}
            successMessage="Photo importée. Vous pouvez l’ajouter à votre carte."
            onUploaded={(asset) => {
              setAssets((items) => ({ ...items, [asset.id]: asset.url }));
              setImageChoices((items) => [...items, asset]);
              setStatus(
                'Photo privée ajoutée. Choisissez-la dans un élément Photo ou logo.',
              );
            }}
          />
        </aside>
        <section>
          <div className={editor.tabs}>
            {document.sides.map((s, i) => (
              <button
                aria-pressed={side === i}
                key={s.name}
                onClick={() => {
                  setSide(i);
                  setSelected(s.elements[0]?.id);
                }}
              >
                {s.name === 'recto' ? 'Recto' : 'Verso'}
              </button>
            ))}
          </div>
          <DesignCanvas
            document={document}
            side={side}
            assets={assets}
            selected={selected}
            onSelect={setSelected}
          />
          <p>Choisissez un élément dans la carte pour le personnaliser.</p>
          <h2>Calques</h2>
          {document.sides[side].elements.map((e, i) => (
            <p key={e.id}>
              <button onClick={() => setSelected(e.id)}>
                {i + 1}. {e.type === 'text' ? e.text.slice(0, 35) : e.type}
              </button>
            </p>
          ))}
        </section>
        <aside
          className={styles.card}
          aria-label="Personnalisation de la carte"
        >
          <h2>Personnalisation</h2>
          {element ? (
            <fieldset disabled={busy} style={{ border: 0, padding: 0 }}>
              {element.type === 'text' && (
                <>
                  <label>
                    Texte
                    <textarea
                      value={element.text}
                      maxLength={2000}
                      rows={5}
                      onChange={(e) => patch({ text: e.target.value })}
                    />
                  </label>
                  <label>
                    Typographie
                    <select
                      value={element.font}
                      onChange={(e) =>
                        patch({ font: e.target.value as DesignElement['font'] })
                      }
                    >
                      <option value="serif">Éditoriale</option>
                      <option value="sans-serif">Contemporaine</option>
                      <option value="cursive">Manuscrite</option>
                    </select>
                  </label>
                  <label>
                    Taille
                    <input
                      type="range"
                      min={8}
                      max={100}
                      value={element.fontSize}
                      onChange={(e) =>
                        patch({ fontSize: Number(e.target.value) })
                      }
                    />
                  </label>
                  <label>
                    Couleur
                    <input
                      type="color"
                      value={element.color}
                      onChange={(e) => patch({ color: e.target.value })}
                    />
                  </label>
                  <label>
                    Alignement
                    <select
                      value={element.align}
                      onChange={(e) =>
                        patch({
                          align: e.target.value as DesignElement['align'],
                        })
                      }
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </label>
                </>
              )}
              {element.type === 'image' && (
                <label>
                  Image
                  <select
                    value={element.image}
                    onChange={(e) => patch({ image: e.target.value })}
                  >
                    <option value="">Choisir</option>
                    <option value="/images/editorial/jardin.jpg">
                      Jardin en lumière
                    </option>
                    <option value="/images/editorial/reception.jpg">
                      Dîner aux chandelles
                    </option>
                    {imageChoices.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {element.type === 'shape' && (
                <>
                  <label>
                    Forme
                    <select
                      value={element.shape}
                      onChange={(e) =>
                        patch({
                          shape: e.target.value as 'rectangle' | 'ellipse',
                        })
                      }
                    >
                      <option value="rectangle">Rectangle</option>
                      <option value="ellipse">Ellipse</option>
                    </select>
                  </label>
                  <label>
                    Couleur
                    <input
                      type="color"
                      value={element.background}
                      onChange={(e) => patch({ background: e.target.value })}
                    />
                  </label>
                </>
              )}
              {(['x', 'y', 'width', 'height'] as const).map((key, i) => (
                <label key={key}>
                  {
                    [
                      'Position horizontale',
                      'Position verticale',
                      'Largeur',
                      'Hauteur',
                    ][i]
                  }{' '}
                  · {element[key]} %
                  <input
                    type="range"
                    min={key === 'x' || key === 'y' ? 0 : 5}
                    max={
                      key === 'x'
                        ? 100 - element.width
                        : key === 'y'
                          ? 100 - element.height
                          : key === 'width'
                            ? 100 - element.x
                            : 100 - element.y
                    }
                    value={element[key]}
                    onChange={(e) => patch({ [key]: Number(e.target.value) })}
                  />
                </label>
              ))}
              <p>
                <button
                  onClick={() => {
                    const elements = document.sides[side].elements.filter(
                      (e) => e.id !== selected,
                    );
                    elements.push(element);
                    change({
                      ...document,
                      sides: document.sides.map((s, i) =>
                        i === side ? { ...s, elements } : s,
                      ),
                    });
                  }}
                >
                  Passer au premier plan
                </button>
              </p>
              <button
                onClick={() => {
                  change({
                    ...document,
                    sides: document.sides.map((s, i) =>
                      i === side
                        ? {
                            ...s,
                            elements: s.elements.filter(
                              (e) => e.id !== selected,
                            ),
                          }
                        : s,
                    ),
                  });
                  setSelected(undefined);
                }}
              >
                Supprimer l’élément
              </button>
            </fieldset>
          ) : (
            <p>Sélectionnez un élément de votre carte.</p>
          )}
        </aside>
      </div>
      <section className={styles.card}>
        <h2>Télécharger ma carte</h2>
        <p>
          Un PDF au format choisi, avec une page par face. Aucune commande
          d’impression n’est nécessaire.
        </p>
        <button
          disabled={
            busy ||
            dirty ||
            revision < 1 ||
            !initial.products.includes('thank_you')
          }
          onClick={() => void download()}
        >
          Télécharger le PDF
        </button>
        {!initial.products.includes('thank_you') && (
          <p>
            <Link href={`/events/${eventId}/offres`}>
              Activer les cartes de remerciement
            </Link>{' '}
            pour télécharger votre création.
          </p>
        )}
        {(dirty || revision < 1) && (
          <p>Enregistrez votre carte avant de la télécharger.</p>
        )}
      </section>
      <MaterialRequestForm
        eventId={eventId}
        revision={revision}
        disabled={dirty || revision < 1 || busy}
        initial={initial.requests}
        stages={initial.requestStages}
      />
      <PrintOrderForm
        eventId={eventId}
        document={document}
        materials={materials}
        disabled={dirty || revision < 1 || busy}
        paymentAvailable={paymentAvailable}
      />
    </div>
  );
}
