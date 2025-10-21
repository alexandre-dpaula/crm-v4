import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { stageSchema } from '@/lib/validators/pipeline';
import { deleteStage, updateStage } from '@/lib/services/pipelines';

export async function PATCH(
  request: Request,
  { params }: { params: { stageId: string } }
) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = stageSchema
      .omit({ position: true })
      .partial()
      .parse(body);

    const stage = await updateStage(user.id, params.stageId, payload);
    return NextResponse.json({ stage });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { stageId: string } }
) {
  try {
    const user = await requireUser();
    await deleteStage(user.id, params.stageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
