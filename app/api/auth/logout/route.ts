import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { deleteCurrentSession } from '@/lib/auth';

export async function POST() {
  try {
    await deleteCurrentSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
