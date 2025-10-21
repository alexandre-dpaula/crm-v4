import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { pipelineSchema } from '@/lib/validators/pipeline';
import {
  createPipeline,
  listPipelines
} from '@/lib/services/pipelines';

export async function GET() {
  try {
    const user = await requireUser();
    const pipelines = await listPipelines(user.id);
    return NextResponse.json({ pipelines });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = pipelineSchema.parse(body);

    const pipeline = await createPipeline(user.id, {
      name: payload.name,
      makeDefault: payload.isDefault
    });

    return NextResponse.json({ pipeline }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
