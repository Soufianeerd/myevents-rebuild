// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { afterEach, it, expect, vi } from 'vitest';
import { EmailConfirmationForm } from '@/app/(auth)/EmailConfirmationForm';
import {
  verifyEmailAction,
  resendConfirmationAction,
} from '@/app/(auth)/actions';
vi.mock('@/app/(auth)/actions', () => ({
  verifyEmailAction: vi.fn(),
  resendConfirmationAction: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
it('labels the OTP fields, supports autofill, and announces successful confirmation', async () => {
  vi.mocked(verifyEmailAction).mockResolvedValue({ success: true });
  render(<EmailConfirmationForm initialEmail="test@example.invalid" />);
  const email = screen.getByLabelText('Adresse e-mail');
  expect(email).toHaveValue('test@example.invalid');
  const code = screen.getByLabelText('Code de confirmation');
  expect(code).toHaveAttribute('autocomplete', 'one-time-code');
  expect(code).toHaveAttribute('inputmode', 'numeric');
  fireEvent.change(code, { target: { value: '123456' } });
  fireEvent.submit(code.closest('form')!);
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(
      'Votre adresse e-mail est confirmée',
    ),
  );
  expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute(
    'href',
    '/connexion',
  );
});
it('displays a safe invalid-code error and allows a separate resend', async () => {
  vi.mocked(verifyEmailAction).mockResolvedValue({
    error: 'Ce code est invalide ou a expiré.',
  });
  vi.mocked(resendConfirmationAction).mockResolvedValue({ success: true });
  render(<EmailConfirmationForm initialEmail="test@example.invalid" />);
  const code = screen.getByLabelText('Code de confirmation');
  fireEvent.change(code, { target: { value: '123456' } });
  fireEvent.submit(code.closest('form')!);
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent('Ce code est invalide'),
  );
  fireEvent.submit(
    screen.getByRole('button', { name: 'Renvoyer un code' }).closest('form')!,
  );
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(
      'un nouveau code a été demandé',
    ),
  );
});
