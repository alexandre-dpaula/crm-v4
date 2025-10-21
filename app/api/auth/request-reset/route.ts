import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleRouteError } from '@/lib/http';
import { requestResetSchema } from '@/lib/validators/auth';
import { generateToken } from '@/lib/passwords';
import { hashToken } from '@/lib/auth';

const RESET_TOKEN_MINUTES = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = requestResetSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null
      }
    });

    const token = generateToken(24);
    const tokenHash = hashToken(token);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_MINUTES * 60 * 1000
    );

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt
      }
    });

    const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    return NextResponse.json({
      success: true,
      resetToken: token,
      resetUrl
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
