import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { reorderStageSchema } from '@/lib/validators/pipeline';
import { reorderStages } from '@/lib/services/pipelines';

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = reorderStageSchema.parse(body);

    const stages = await reorderStages(
      user.id,
      payload.pipelineId,
      payload.stageIds
    );

    return NextResponse.json({ stages });
  } catch (error) {
    return handleRouteError(error);
  }
}
