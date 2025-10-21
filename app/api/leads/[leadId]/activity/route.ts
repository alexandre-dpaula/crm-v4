import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { getLeadActivity } from '@/lib/services/leads';

export async function GET(
  _request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const user = await requireUser();
    const activity = await getLeadActivity(user.id, params.leadId);
    return NextResponse.json({ activity });
  } catch (error) {
    return handleRouteError(error);
  }
}
