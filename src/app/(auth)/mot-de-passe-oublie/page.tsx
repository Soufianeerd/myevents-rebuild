'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { forgotPasswordAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = React.useActionState(
    forgotPasswordAction,
    initialState,
  );

  if (state.success) {
    return (
      <div className="bg-white px-8 py-10 shadow-sm rounded-2xl border border-neutral-200 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 mb-4">
          <svg
            className="h-6 w-6 text-success"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Vérifiez votre e-mail
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          Si un compte correspond à cette adresse, nous vous avons envoyé un
          lien pour réinitialiser votre mot de passe.
        </p>
        <Link
          href="/connexion"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white px-8 py-10 shadow-sm rounded-2xl border border-neutral-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Mot de passe oublié ?
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Entrez votre e-mail pour recevoir un lien de réinitialisation.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
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

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Envoi en cours...' : 'Envoyer le lien'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link
          href="/connexion"
          className="font-medium text-neutral-500 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm transition-colors"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
