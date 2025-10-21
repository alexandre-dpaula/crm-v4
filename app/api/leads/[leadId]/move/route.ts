import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { leadMoveSchema } from '@/lib/validators/leads';
import { moveLead } from '@/lib/services/leads';

export async function POST(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = leadMoveSchema.parse(body);

    const lead = await moveLead(user.id, params.leadId, {
      pipelineId: payload.pipelineId,
      stageId: payload.stageId
    });

    return NextResponse.json({ lead });
  } catch (error) {
    return handleRouteError(error);
  }
}
