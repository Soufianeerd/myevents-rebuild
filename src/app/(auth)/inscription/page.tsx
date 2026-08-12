'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { registerAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = React.useActionState(
    registerAction,
    initialState,
  );

  return (
    <div className="bg-white px-8 py-10 shadow-sm rounded-2xl border border-neutral-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Rejoignez MyEvent&apos;s aujourd&apos;hui
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.error && (
          <div className="rounded-md bg-danger-bg p-3 text-sm text-danger border border-danger/20">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-neutral-700 mb-1"
            htmlFor="displayName"
          >
            Nom complet
          </label>
          <Input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            required
            aria-invalid={!!state.fieldErrors?.displayName}
            aria-describedby={
              state.fieldErrors?.displayName ? 'displayName-error' : undefined
            }
          />
          {state.fieldErrors?.displayName && (
            <p id="displayName-error" className="text-sm text-danger mt-1">
              {state.fieldErrors.displayName[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-neutral-700 mb-1"
            htmlFor="email"
          >
            Adresse e-mail
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={!!state.fieldErrors?.email}
            aria-describedby={
              state.fieldErrors?.email ? 'email-error' : undefined
            }
          />
          {state.fieldErrors?.email && (
            <p id="email-error" className="text-sm text-danger mt-1">
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-neutral-700 mb-1"
            htmlFor="password"
          >
            Mot de passe
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            aria-invalid={!!state.fieldErrors?.password}
            aria-describedby={
              state.fieldErrors?.password ? 'password-error' : undefined
            }
          />
          <p className="text-xs text-neutral-500 mt-1">
            Au moins 8 caractères.
          </p>
          {state.fieldErrors?.password && (
            <p id="password-error" className="text-sm text-danger mt-1">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Création en cours...' : 'Créer mon compte'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-neutral-500">Vous avez déjà un compte ? </span>
        <Link
          href="/connexion"
          className="font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
        >
          Se connecter
        </Link>
      </div>
    </div>
  );
}
