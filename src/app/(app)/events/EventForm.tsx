'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Field, FieldLabel, FieldError } from '@/components/ui/Field';
import {
  createEventAction,
  updateEventAction,
} from '../actions/events/actions';
import { Input, Select } from '@/components/ui';
import type { Event as EventModel } from '@/core/events/models';
import { toEventLocalTime } from '@/core/events/dates';

export function EventForm({ initialEvent }: { initialEvent?: EventModel }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[] | undefined>
  >({});
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const result = initialEvent
          ? await updateEventAction(initialEvent.id, formData)
          : await createEventAction(formData);
        if (!result.success) {
          setError(result.error || 'Vérifiez les champs indiqués.');
          setFieldErrors('errors' in result ? result.errors || {} : {});
        } else {
          router.push(
            initialEvent ? `/events/${initialEvent.id}` : '/dashboard',
          );
          router.refresh();
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
          {initialEvent ? 'Modifier l’événement' : 'Créer un événement'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field error={!!fieldErrors.type}>
              <FieldLabel>Type d&apos;événement *</FieldLabel>
              <Select
                name="type"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue={initialEvent?.type || 'wedding'}
                disabled={!!initialEvent}
              >
                <option value="wedding">Mariage</option>
                <option value="birthday">Anniversaire</option>
                <option value="corporate">Entreprise</option>
                <option value="association">Association</option>
                <option value="other">Autre</option>
              </Select>
              {fieldErrors.type && (
                <FieldError>{fieldErrors.type?.[0]}</FieldError>
              )}
            </Field>

            <Field error={!!fieldErrors.defaultLanguage}>
              <FieldLabel>Langue par défaut *</FieldLabel>
              <Select
                name="defaultLanguage"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue={initialEvent?.defaultLanguage || 'fr'}
              >
                <option value="fr">Français</option>
                <option value="en">Anglais</option>
                <option value="ar">العربية</option>
              </Select>
              {fieldErrors.defaultLanguage && (
                <FieldError>{fieldErrors.defaultLanguage?.[0]}</FieldError>
              )}
            </Field>
          </div>

          <Field error={!!fieldErrors.name}>
            <FieldLabel>Nom de l&apos;événement *</FieldLabel>
            <Input
              type="text"
              name="name"
              maxLength={100}
              defaultValue={initialEvent?.name}
              required
              placeholder="Ex: Mariage de Sarah & Marc"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {fieldErrors.name && (
              <FieldError>{fieldErrors.name?.[0]}</FieldError>
            )}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field error={!!fieldErrors.startAt}>
              <FieldLabel>Date de début *</FieldLabel>
              <Input
                type="datetime-local"
                name="startAt"
                defaultValue={
                  initialEvent
                    ? toEventLocalTime(
                        initialEvent.startAt,
                        initialEvent.timezone,
                      )
                    : undefined
                }
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {fieldErrors.startAt && (
                <FieldError>{fieldErrors.startAt?.[0]}</FieldError>
              )}
            </Field>

            <Field error={!!fieldErrors.timezone}>
              <FieldLabel>Fuseau horaire *</FieldLabel>
              <Select
                name="timezone"
                required
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue={initialEvent?.timezone || 'Europe/Paris'}
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Africa/Casablanca">Africa/Casablanca</option>
              </Select>
              {fieldErrors.timezone && (
                <FieldError>{fieldErrors.timezone?.[0]}</FieldError>
              )}
            </Field>
          </div>

          <Field error={!!fieldErrors.primaryLocation}>
            <FieldLabel>Lieu principal (optionnel)</FieldLabel>
            <Input
              type="text"
              name="primaryLocation"
              maxLength={500}
              defaultValue={initialEvent?.primaryLocation}
              placeholder="Ex: Domaine de la Rose, Paris"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
            />
            {fieldErrors.primaryLocation && (
              <FieldError>{fieldErrors.primaryLocation?.[0]}</FieldError>
            )}
          </Field>

          <Field error={!!fieldErrors.endAt}>
            <FieldLabel>Date de fin (optionnelle)</FieldLabel>
            <Input
              type="datetime-local"
              name="endAt"
              defaultValue={
                initialEvent?.endAt
                  ? toEventLocalTime(initialEvent.endAt, initialEvent.timezone)
                  : undefined
              }
            />
            {fieldErrors.endAt && (
              <FieldError>{fieldErrors.endAt[0]}</FieldError>
            )}
          </Field>

          <div className="pt-4 flex flex-wrap justify-end gap-3 border-t border-neutral-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                router.push(
                  initialEvent ? `/events/${initialEvent.id}` : '/dashboard',
                )
              }
            >
              Annuler
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending}>
              {initialEvent
                ? 'Enregistrer les modifications'
                : 'Créer l’événement'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
