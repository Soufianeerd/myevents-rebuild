import { notFound } from 'next/navigation';
import { env } from '@/lib/env';
import { EmailConfirmationForm } from '../EmailConfirmationForm';

export const dynamic = 'force-dynamic';
export default function ConfirmEmailPage() {
  if (env.APP_MODE !== 'connected' || env.CONNECTED_PROVIDER !== 'neon')
    notFound();
  return <EmailConfirmationForm initialEmail="" />;
}
