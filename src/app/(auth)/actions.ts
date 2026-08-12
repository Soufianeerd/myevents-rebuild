'use server';

import { redirect } from 'next/navigation';
import { createContainer } from '@/server/container';
import { getSessionCookie, clearSessionCookie } from '@/server/auth/session';
import {
  LoginUserUseCase,
  RegisterUserUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  LogoutSessionUseCase,
} from '@/core/auth';

export async function logoutAction() {
  const sessionToken = await getSessionCookie();
  if (sessionToken) {
    const { sessionRepository, tokenHasher } = createContainer();
    const logoutUseCase = new LogoutSessionUseCase(
      sessionRepository,
      tokenHasher,
    );
    await logoutUseCase.execute(sessionToken);
  }

  await clearSessionCookie();
  redirect('/connexion');
}

export type ActionState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

import { z } from 'zod';
import { setSessionCookie } from '@/server/auth/session';

const LoginSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
  password: z.string().min(1, 'Le mot de passe est requis.'),
});

export async function loginAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const parsed = LoginSchema.safeParse(data);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const {
    userRepository,
    sessionRepository,
    passwordHasher,
    tokenHasher,
    secretTokenProvider,
    idGenerator,
    clock,
  } = createContainer();
  const useCase = new LoginUserUseCase(
    userRepository,
    sessionRepository,
    passwordHasher,
    tokenHasher,
    secretTokenProvider,
    idGenerator,
    clock,
  );

  const result = await useCase.execute(parsed.data);
  if (!result.ok) {
    return { error: result.error.message };
  }

  await setSessionCookie(
    result.value.rawSessionToken,
    new Date(result.value.session.expiresAt),
  );
  redirect('/dashboard');
}

const RegisterSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'Le prénom doit contenir au moins 2 caractères.'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
    email: z.string().email('Adresse e-mail invalide.'),
    password: z
      .string()
      .min(15, 'Le mot de passe doit contenir au moins 15 caractères.'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['passwordConfirmation'],
  });

export async function registerAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const parsed = RegisterSchema.safeParse(data);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const {
    userRepository,
    sessionRepository,
    passwordHasher,
    tokenHasher,
    secretTokenProvider,
    idGenerator,
    clock,
  } = createContainer();
  const useCase = new RegisterUserUseCase(
    userRepository,
    sessionRepository,
    passwordHasher,
    tokenHasher,
    secretTokenProvider,
    idGenerator,
    clock,
  );

  const result = await useCase.execute(parsed.data);
  if (!result.ok) {
    return { error: result.error.message };
  }

  await setSessionCookie(
    result.value.rawSessionToken,
    new Date(result.value.session.expiresAt),
  );
  redirect('/dashboard');
}

const ForgotPasswordSchema = z.object({
  email: z.string().email('Adresse e-mail invalide.'),
});

export async function forgotPasswordAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const parsed = ForgotPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const {
    userRepository,
    passwordResetRepository,
    mailProvider,
    tokenHasher,
    secretTokenProvider,
    appUrlProvider,
    idGenerator,
    clock,
  } = createContainer();
  const useCase = new RequestPasswordResetUseCase(
    userRepository,
    passwordResetRepository,
    mailProvider,
    tokenHasher,
    secretTokenProvider,
    appUrlProvider,
    idGenerator,
    clock,
  );

  await useCase.execute(parsed.data);

  // Always return success to prevent email enumeration
  return { success: true };
}

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token manquant.'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
});

export async function resetPasswordAction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = Object.fromEntries(formData);
  const parsed = ResetPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const {
    userRepository,
    sessionRepository,
    passwordResetRepository,
    passwordHasher,
    tokenHasher,
    clock,
  } = createContainer();
  const useCase = new ResetPasswordUseCase(
    userRepository,
    sessionRepository,
    passwordResetRepository,
    passwordHasher,
    tokenHasher,
    clock,
  );

  const result = await useCase.execute({
    rawResetToken: parsed.data.token,
    newPassword: parsed.data.password,
  });

  if (!result.ok) {
    return { error: result.error.message };
  }

  return { success: true };
}
