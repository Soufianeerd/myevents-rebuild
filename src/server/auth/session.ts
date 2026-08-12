import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'myevents_session';

export async function setSessionCookie(
  rawSessionToken: string,
  expiresAt: Date,
) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawSessionToken, {
    httpOnly: true,
    secure: false, // Local-first session always runs on HTTP locally
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  return sessionCookie?.value || null;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
