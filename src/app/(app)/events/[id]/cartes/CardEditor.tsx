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
type Initial = {
  document: Design;
  revision: number;
  products: string[];
  assets: Record<string, string>;
  imageChoices: { id: string; name: string }[];
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
    const snapshot = document;
    const result = await saveDesignAction(eventId, snapshot, revision);
    if (result.ok) {
      setRevision(result.record.revision);
      setDirty(false);
      setStatus('Carte enregistrée.');
    } else setStatus(result.error);
    setBusy(false);
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
        <aside className={styles.card}>
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
          <Link href={`/events/${eventId}/souvenirs`}>
            Ajouter une photo à mes souvenirs
          </Link>
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
            assets={initial.assets}
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
        <aside className={styles.card}>
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
                    {initial.imageChoices.map((i) => (
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
