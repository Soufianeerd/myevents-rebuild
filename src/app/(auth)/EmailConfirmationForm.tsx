'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import {
  verifyEmailAction,
  resendConfirmationAction,
  type ActionState,
} from './actions';

export function EmailConfirmationForm({
  initialEmail,
}: {
  initialEmail: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [state, verify, pending] = useActionState(
    verifyEmailAction,
    {} as ActionState,
  );
  const [resendState, resend, resending] = useActionState(
    resendConfirmationAction,
    {} as ActionState,
  );
  if (state.success)
    return (
      <div className="bg-white mx-[8px] sm:mx-0 px-[24px] py-[32px] sm:px-[32px] shadow-sm rounded-2xl border border-neutral-200">
        <h2 className="text-2xl font-semibold">Adresse confirmée</h2>
        <p className="mt-3 text-neutral-600" role="status">
          Votre adresse e-mail est confirmée. Vous pouvez vous connecter.
        </p>
        <Link
          href="/connexion"
          className="mt-6 inline-block text-primary underline"
        >
          Se connecter
        </Link>
      </div>
    );
  return (
    <div className="bg-white mx-[8px] sm:mx-0 px-[24px] py-[32px] sm:px-[32px] shadow-sm rounded-2xl border border-neutral-200">
      <h2 className="text-2xl font-semibold">Confirmer mon adresse</h2>
      <p className="mt-3 mb-6 text-sm text-neutral-600">
        Saisissez le code à six chiffres reçu par e-mail. Il expire après 15
        minutes.
      </p>
      <form action={verify} className="space-y-5">
        <div>
          <label
            htmlFor="confirmation-email"
            className="block text-sm font-medium mb-2"
          >
            Adresse e-mail
          </label>
          <Input
            id="confirmation-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
            aria-invalid={!!state.fieldErrors?.email}
            aria-describedby={
              state.fieldErrors?.email ? 'confirmation-email-error' : undefined
            }
          />
          {state.fieldErrors?.email && (
            <p
              id="confirmation-email-error"
              className="text-sm text-danger mt-1"
            >
              {state.fieldErrors.email[0]}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="confirmation-code"
            className="block text-sm font-medium mb-2"
          >
            Code de confirmation
          </label>
          <Input
            id="confirmation-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            minLength={6}
            maxLength={6}
            required
            aria-invalid={!!state.fieldErrors?.code}
            aria-describedby={
              state.fieldErrors?.code ? 'confirmation-code-error' : undefined
            }
          />
          {state.fieldErrors?.code && (
            <p
              id="confirmation-code-error"
              className="text-sm text-danger mt-1"
            >
              {state.fieldErrors.code[0]}
            </p>
          )}
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-danger">
            {state.error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={pending || resending}
        >
          {pending ? 'Confirmation…' : 'Confirmer mon adresse'}
        </Button>
      </form>
      <form action={resend} className="mt-[16px]">
        <input name="email" type="hidden" value={email} />
        <Button
          type="submit"
          variant="secondary"
          className="w-full"
          disabled={pending || resending}
        >
          {resending ? 'Envoi…' : 'Renvoyer un code'}
        </Button>
      </form>
      {resendState.success && (
        <p role="status" className="mt-3 text-sm text-neutral-600">
          Si cette adresse attend une confirmation, un nouveau code a été
          demandé.
        </p>
      )}
      {(resendState.error || resendState.fieldErrors?.email) && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {resendState.error || resendState.fieldErrors?.email?.[0]}
        </p>
      )}
      <Link
        href="/connexion"
        className="mt-6 inline-block text-primary underline"
      >
        Retour à la connexion
      </Link>
    </div>
  );
}
