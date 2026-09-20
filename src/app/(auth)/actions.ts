'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createAuthenticationProvider } from '@/server/auth/provider';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '@/core/auth/utils/PasswordPolicy';

export type ActionState = {
  success?: boolean;
  confirmationEmail?: string;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
const emailSchema = z
  .string()
  .trim()
  .max(254)
  .email('Adresse e-mail invalide.');
const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    'Le mot de passe doit contenir au moins 15 caractères.',
  )
  .max(
    PASSWORD_MAX_LENGTH,
    'Le mot de passe est trop long (maximum 128 caractères).',
  );
const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Le mot de passe est requis.')
    .max(PASSWORD_MAX_LENGTH),
});
const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, 'Le prénom doit contenir au moins 2 caractères.')
      .max(100),
    lastName: z
      .string()
      .trim()
      .min(2, 'Le nom doit contenir au moins 2 caractères.')
      .max(100),
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().max(PASSWORD_MAX_LENGTH),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['passwordConfirmation'],
  });

export async function logoutAction() {
  await (await createAuthenticationProvider()).logout();
  redirect('/connexion');
}
export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await (
    await createAuthenticationProvider()
  ).login(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    const details = result.error.details;
    if (details && typeof details === 'object' && details.confirmationRequired)
      return { confirmationEmail: parsed.data.email };
    return { error: result.error.message };
  }
  redirect('/dashboard');
}
export async function registerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  const provider = await createAuthenticationProvider();
  const result = await provider.register(parsed.data);
  if (!result.ok) return { error: result.error.message };
  if (result.value.confirmationRequired)
    return provider.confirmationMethod === 'code'
      ? { confirmationEmail: parsed.data.email }
      : { success: true };
  redirect('/dashboard');
}
export async function forgotPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ email: emailSchema })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  await (await createAuthenticationProvider()).requestReset(parsed.data.email);
  return { success: true };
}
export async function resetPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ token: z.string().min(1).max(256), password: passwordSchema })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  const result = await (
    await createAuthenticationProvider()
  ).reset(parsed.data.token, parsed.data.password);
  return result.ok ? { success: true } : { error: result.error.message };
}

export async function verifyEmailAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({
      email: emailSchema,
      code: z.string().regex(/^\d{6}$/, 'Saisissez le code à six chiffres.'),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  const provider = await createAuthenticationProvider();
  if (!provider.verifyEmail)
    return { error: 'La confirmation par code n’est pas disponible.' };
  const result = await provider.verifyEmail(
    parsed.data.email,
    parsed.data.code,
  );
  return result.ok ? { success: true } : { error: result.error.message };
}
export async function resendConfirmationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = z
    .object({ email: emailSchema })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  const provider = await createAuthenticationProvider();
  if (!provider.resendConfirmation)
    return { error: 'La confirmation par code n’est pas disponible.' };
  await provider.resendConfirmation(parsed.data.email);
  return { success: true };
}
