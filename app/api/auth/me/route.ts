import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { getSession, requireUser } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validators/auth';
import { updateUserProfile } from '@/lib/services/user';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ user: session.user });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = updateProfileSchema.parse(body);

    const updated = await updateUserProfile(user.id, {
      name: payload.name,
      phone: payload.phone || null,
      avatarUrl: payload.avatarUrl || null,
      timezone: payload.timezone || null
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
