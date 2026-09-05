'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/Button';
import { Field, FieldLabel } from '../../../../components/ui/Field';
import { createEventAction } from '../../actions/events/actions';

export default function CreateEventPage() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = await createEventAction(formData);
        if (!result.success) {
          setError(result.error || 'Erreur lors de la création');
        } else {
          router.push('/dashboard');
        }
      } catch {
        setError('Une erreur est survenue');
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold leading-[34px] tracking-tight text-neutral-900">
          Créer un événement
        </h1>
        <p className="mt-1 text-[13px] text-neutral-500">
          Renseignez les informations principales. Vous pourrez les modifier
          plus tard.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {error && (
          <div
            className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Type d&apos;événement *</FieldLabel>
              <select
                name="type"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue="wedding"
              >
                <option value="wedding">Mariage</option>
                <option value="birthday">Anniversaire</option>
                <option value="corporate">Entreprise</option>
                <option value="other">Autre</option>
              </select>
            </Field>

            <Field>
              <FieldLabel>Langue par défaut *</FieldLabel>
              <select
                name="defaultLanguage"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue="fr"
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
              </select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Nom de l&apos;événement *</FieldLabel>
            <input
              type="text"
              name="name"
              required
              placeholder="Ex: Mariage de Sarah & Marc"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Date de début *</FieldLabel>
              <input
                type="datetime-local"
                name="startAt"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </Field>

            <Field>
              <FieldLabel>Fuseau horaire *</FieldLabel>
              <select
                name="timezone"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue="Europe/Paris"
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Africa/Casablanca">Africa/Casablanca</option>
              </select>
            </Field>
          </div>

          <Field>
            <FieldLabel>Lieu principal (optionnel)</FieldLabel>
            <input
              type="text"
              name="primaryLocation"
              placeholder="Ex: Domaine de la Rose, Paris"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
          </Field>

          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending}>
              Créer l&apos;événement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
