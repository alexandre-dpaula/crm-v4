import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser, revokeAllSessions, createSession } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validators/auth';
import { changeUserPassword } from '@/lib/services/user';

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = changePasswordSchema.parse(body);

    await changeUserPassword(
      user.id,
      payload.currentPassword,
      payload.newPassword
    );

    await revokeAllSessions(user.id);
    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
