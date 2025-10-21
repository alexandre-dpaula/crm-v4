import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { handleRouteError } from '@/lib/http';
import { registerSchema } from '@/lib/validators/auth';
import { ValidationError } from '@/lib/errors';
import { hashPassword } from '@/lib/passwords';
import { createSession, sanitizeUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: payload.email }
    });
    if (existing) {
      throw new ValidationError({ email: 'Email já cadastrado.' });
    }

    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.user.create({
        data: {
          name: payload.name,
          email: payload.email,
          passwordHash,
          pipelines: {
            create: {
              name: 'Pipeline Principal',
              isDefault: true,
              stages: {
                create: [
                  {
                    name: 'Novos',
                    position: 0,
                    color: '#2563eb'
                  },
                  {
                    name: 'Contato Realizado',
                    position: 1,
                    color: '#0ea5e9'
                  },
                  {
                    name: 'Qualificado',
                    position: 2,
                    color: '#22c55e'
                  },
                  {
                    name: 'Fechado',
                    position: 3,
                    color: '#16a34a'
                  }
                ]
              }
            }
          }
        }
      });

      await tx.user.update({
        where: { id: created.id },
        data: { lastLoginAt: new Date() }
      });

      return created;
    });

    await createSession(user.id);

    return NextResponse.json(
      {
        user: sanitizeUser(user)
      },
      { status: 201 }
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
