// This is a configuration guard, not JWT authentication. Supabase verifies keys.
// Prevent a privileged server key from silently bypassing the user-facing RLS.
export function isSupabasePublicKey(value: string): boolean {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return true;
  const parts = value.split('.');
  if (parts.length !== 3 || parts.some((part) => !part)) return false;
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    );
    return payload.role === 'anon';
  } catch {
    return false;
  }
}
