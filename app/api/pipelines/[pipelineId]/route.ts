import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import {
  assertPipelineOwnership,
  deletePipeline,
  updatePipeline
} from '@/lib/services/pipelines';
import { pipelineSchema } from '@/lib/validators/pipeline';

export async function GET(
  _request: Request,
  { params }: { params: { pipelineId: string } }
) {
  try {
    const user = await requireUser();
    const pipeline = await assertPipelineOwnership(user.id, params.pipelineId);
    return NextResponse.json({ pipeline });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { pipelineId: string } }
) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = pipelineSchema.partial().parse(body);

    const pipeline = await updatePipeline(user.id, params.pipelineId, {
      name: payload.name,
      isDefault: payload.isDefault
    });

    return NextResponse.json({ pipeline });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { pipelineId: string } }
) {
  try {
    const user = await requireUser();
    await deletePipeline(user.id, params.pipelineId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
