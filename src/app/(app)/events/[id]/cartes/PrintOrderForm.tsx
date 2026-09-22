'use client';
import { useState, type FormEvent } from 'react';
import type { Design } from '@/core/designs/models';
import {
  quotePrint,
  type PrintMaterial,
  printRequestSchema,
} from '@/core/designs/printing';
import { orderPrintAction } from './actions';
import styles from '../workspace.module.css';
export function PrintOrderForm({
  eventId,
  document,
  materials,
  disabled,
  paymentAvailable,
}: {
  eventId: string;
  document: Design;
  materials: PrintMaterial[];
  disabled: boolean;
  paymentAvailable: boolean;
}) {
  const [materialId, setMaterialId] = useState(materials[0].id),
    [quantity, setQuantity] = useState(50),
    [finish, setFinish] = useState<'mat' | 'satin'>('mat'),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const material = materials.find((m) => m.id === materialId)!;
  const amount = material.unitAmount * quantity + material.deliveryAmount;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const request = printRequestSchema.parse({
        materialId,
        quantity,
        finish,
        approved: form.get('approved') === 'on',
        address: Object.fromEntries(
          ['name', 'line1', 'line2', 'postalCode', 'city', 'country'].map(
            (key) => [key, form.get(key)],
          ),
        ),
      });
      quotePrint(document, material, request);
      setBusy(true);
      const result = await orderPrintAction(eventId, request);
      if (result.ok) window.location.assign(result.url);
      else setMessage(result.error);
    } catch {
      setMessage('Vérifiez la quantité, le support et les coordonnées.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.card}>
      <h2>Votre commande d’impression</h2>
      <p>
        Simulation Stripe Test : aucune impression ni expédition réelle. Les
        tarifs ci-dessous servent aux essais.
      </p>
      <form onSubmit={submit}>
        <fieldset disabled={disabled || busy} style={{ border: 0, padding: 0 }}>
          <div className={styles.grid}>
            <div>
              <label>
                Support
                <select
                  value={materialId}
                  onChange={(e) => {
                    setMaterialId(e.target.value);
                    setFinish('mat');
                  }}
                >
                  {materials
                    .filter(
                      (m) =>
                        m.active &&
                        m.formats.includes(
                          `${document.widthMm}x${document.heightMm}`,
                        ),
                    )
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {(m.unitAmount / 100).toFixed(2)} € / unité
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Finition
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value as 'mat' | 'satin')}
                >
                  {material.finishes.map((f) => (
                    <option key={f} value={f}>
                      {f === 'mat' ? 'Mate' : 'Satinée'}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Quantité
                <input
                  type="number"
                  min={material.minimum}
                  max={material.maximum}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </label>
              <p>
                Sous-total :{' '}
                {((material.unitAmount * quantity) / 100).toFixed(2)} €
              </p>
              <p>Livraison : {(material.deliveryAmount / 100).toFixed(2)} €</p>
              <p className={styles.price}>{(amount / 100).toFixed(2)} €</p>
            </div>
            <div>
              <h2>Adresse de livraison</h2>
              {[
                ['name', 'Nom complet'],
                ['line1', 'Adresse'],
                ['line2', 'Complément'],
                ['postalCode', 'Code postal'],
                ['city', 'Ville'],
              ].map(([name, label]) => (
                <label key={name}>
                  {label}
                  <input
                    name={name}
                    required={name !== 'line2'}
                    maxLength={150}
                  />
                </label>
              ))}
              <label>
                Pays
                <select name="country">
                  <option value="FR">France</option>
                  <option value="BE">Belgique</option>
                  <option value="CH">Suisse</option>
                  <option value="MA">Maroc</option>
                  <option value="LU">Luxembourg</option>
                </select>
              </label>
            </div>
          </div>
          <label>
            <input type="checkbox" name="approved" required /> J’ai vérifié le
            recto, le verso, les textes et les QR codes de ma carte.
          </label>
          <button
            disabled={!paymentAvailable || disabled || busy}
            type="submit"
          >
            {busy ? 'Préparation…' : 'Payer avec Stripe Test'}
          </button>
        </fieldset>
      </form>
      {disabled && (
        <p>Enregistrez les modifications de votre carte avant de commander.</p>
      )}
      {!paymentAvailable && (
        <p>Le paiement sera disponible dès que Stripe Test sera connecté.</p>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
