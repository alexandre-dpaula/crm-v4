import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleRouteError } from '@/lib/http';
import { resetPasswordSchema } from '@/lib/validators/auth';
import { hashPassword } from '@/lib/passwords';
import { hashToken, createSession } from '@/lib/auth';
import { ValidationError } from '@/lib/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = resetPasswordSchema.parse(body);

    const tokenHash = hashToken(payload.token);

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (
      !tokenRecord ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new ValidationError({
        token: 'Token inválido ou expirado.'
      });
    }

    const passwordHash = await hashPassword(payload.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() }
      }),
      prisma.session.updateMany({
        where: { userId: tokenRecord.userId },
        data: { revokedAt: new Date() }
      })
    ]);

    await createSession(tokenRecord.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
