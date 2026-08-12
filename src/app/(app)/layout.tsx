import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentSafeUser } from '@/server/auth/getCurrentAccessContext';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const safeUser = await getCurrentSafeUser();

  if (!safeUser) {
    redirect('/connexion');
  }

  return <AppShell user={safeUser}>{children}</AppShell>;
}
