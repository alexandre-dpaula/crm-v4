import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { stageSchema } from '@/lib/validators/pipeline';
import { createStage } from '@/lib/services/pipelines';

export async function POST(
  request: Request,
  { params }: { params: { pipelineId: string } }
) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = stageSchema.omit({ position: true }).parse(body);

    const stage = await createStage(user.id, params.pipelineId, {
      name: payload.name,
      color: payload.color
    });

    return NextResponse.json({ stage }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
