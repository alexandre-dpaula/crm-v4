import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Session, User } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'ps_session';

const SESSION_DAYS = 7;
const REMEMBER_ME_DAYS = 30;

export type SafeUser = Omit<User, 'passwordHash'>;

export const sanitizeUser = (user: User): SafeUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
};

const sha256 = (value: string): string =>
  crypto.createHash('sha256').update(value).digest('hex');

export const hashToken = (value: string): string => sha256(value);

const buildExpiry = (remember?: boolean): Date => {
  const days = remember ? REMEMBER_ME_DAYS : SESSION_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

const getClientInfo = () => {
  const headerStore = headers();
  const userAgent = headerStore.get('user-agent') ?? undefined;
  const forwardedFor = headerStore.get('x-forwarded-for') ?? undefined;
  const ip = forwardedFor?.split(',')?.[0]?.trim();
  return { userAgent, ipAddress: ip };
};

export async function getSession(): Promise<
  (Session & { user: SafeUser }) | null
> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const tokenHash = sha256(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true }
  });

  if (!session) {
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  if (session.expiresAt < new Date() || session.revokedAt) {
    await prisma.session.delete({ where: { id: session.id } });
    cookies().delete(SESSION_COOKIE);
    return null;
  }

  return {
    ...session,
    user: sanitizeUser(session.user)
  };
}

export async function requireUser(): Promise<SafeUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHENTICATED');
  }
  return session.user;
}

export async function createSession(
  userId: string,
  remember?: boolean
): Promise<Session> {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = sha256(token);
  const expiresAt = buildExpiry(remember);
  const { userAgent, ipAddress } = getClientInfo();

  const session = await prisma.session.create({
    data: {
      tokenHash,
      userId,
      userAgent,
      ipAddress,
      expiresAt
    }
  });

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt
  });

  return session;
}

export async function deleteCurrentSession(): Promise<void> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return;
  }
  const tokenHash = sha256(token);
  await prisma.session.deleteMany({
    where: {
      tokenHash
    }
  });
  cookies().delete(SESSION_COOKIE);
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId },
    data: { revokedAt: new Date() }
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: '',
    path: '/',
    expires: new Date(0)
  });
}

export function setAuthCookie(response: NextResponse, token: string, {
  remember
}: {
  remember?: boolean;
} = {}): void {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: buildExpiry(remember)
  });
}

export function respondWithSession(
  payload: unknown,
  sessionToken: string,
  remember?: boolean
): NextResponse {
  const response = NextResponse.json(payload);
  response.cookies.set({
    name: SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: buildExpiry(remember)
  });
  return response;
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }
  return session.user;
}
