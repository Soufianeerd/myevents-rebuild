'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import { loginAction, type ActionState } from '../actions';

const initialState: ActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = React.useActionState(
    loginAction,
    initialState,
  );

  return (
    <div className="bg-white px-8 py-10 shadow-sm rounded-2xl border border-neutral-200">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Connexion
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Bienvenue sur MyEvent&apos;s
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
          <div className="flex items-center justify-between">
            <label
              className="block text-sm font-medium text-neutral-700 mb-1"
              htmlFor="password"
            >
              Mot de passe
            </label>
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={!!state.fieldErrors?.password}
            aria-describedby={
              state.fieldErrors?.password ? 'password-error' : undefined
            }
          />
          {state.fieldErrors?.password && (
            <p id="password-error" className="text-sm text-danger mt-1">
              {state.fieldErrors.password[0]}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-neutral-500">Pas encore de compte ? </span>
        <Link
          href="/inscription"
          className="font-medium text-primary hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring rounded-sm"
        >
          S&apos;inscrire
        </Link>
      </div>
    </div>
  );
}
