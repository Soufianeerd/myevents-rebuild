'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { resetPasswordAction, type ActionState } from '../actions';

const initialState: ActionState = {};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, formAction, isPending] = React.useActionState(
    resetPasswordAction,
    initialState,
  );

  if (!token) {
    return (
      <div className="bg-white px-8 py-10 shadow-sm rounded-2xl border border-neutral-200 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 mb-4">
          <svg
            className="h-6 w-6 text-danger"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
          Lien invalide
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          Le lien de réinitialisation est manquant ou invalide.
        </p>
        <Link
          href="/mot-de-passe-oublie"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

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
          Mot de passe mis à jour
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          Votre mot de passe a été modifié avec succès. Vous pouvez maintenant
          vous connecter.
        </p>
        <Link
          href="/connexion"
          className="inline-flex h-[36px] items-center justify-center rounded-[10px] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white px-8 py-10 shadow-sm rounded-2xl border border-neutral-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Nouveau mot de passe
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Choisissez un nouveau mot de passe sécurisé.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="token" value={token} />

        {state.error && (
          <div className="rounded-md bg-danger-bg p-3 text-sm text-danger border border-danger/20">
            {state.error}
          </div>
        )}

        <div className="space-y-2">
          <label
            className="block text-sm font-medium text-neutral-700 mb-1"
            htmlFor="password"
          >
            Nouveau mot de passe
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
          {isPending ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-neutral-500 text-sm">
          Chargement...
        </div>
      }
    >
      <ResetPasswordForm />
    </React.Suspense>
  );
}
