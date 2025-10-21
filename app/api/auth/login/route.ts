import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleRouteError } from '@/lib/http';
import { loginSchema } from '@/lib/validators/auth';
import { ValidationError } from '@/lib/errors';
import { verifyPassword } from '@/lib/passwords';
import { createSession, sanitizeUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      throw new ValidationError({ email: 'Email ou senha inválidos.' });
    }

    const passwordOk = await verifyPassword(
      payload.password,
      user.passwordHash
    );

    if (!passwordOk) {
      throw new ValidationError({ email: 'Email ou senha inválidos.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    await createSession(user.id, payload.remember);

    return NextResponse.json({
      user: sanitizeUser(user)
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
