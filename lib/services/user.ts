import { prisma } from '@/lib/prisma';
import { sanitizeUser } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/passwords';
import { ForbiddenError, NotFoundError } from '@/lib/errors';

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function updateUserProfile(
  userId: string,
  data: {
    name: string;
    phone?: string | null;
    avatarUrl?: string | null;
    timezone?: string | null;
  }
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone || null,
      avatarUrl: data.avatarUrl || null,
      timezone: data.timezone || null
    }
  });
  return sanitizeUser(user);
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('Usuário não encontrado.');
  }

  const match = await verifyPassword(currentPassword, user.passwordHash);
  if (!match) {
    throw new ForbiddenError('Senha atual incorreta.');
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  });
}
