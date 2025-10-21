import { LeadPriority, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { leadUpsertSchema } from '@/lib/validators/leads';
import {
  assertLeadOwnership,
  deleteLead,
  updateLead
} from '@/lib/services/leads';
import { ValidationError } from '@/lib/errors';

const parseValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'number') {
    return new Prisma.Decimal(value);
  }
  const normalized = value.replace(',', '.');
  if (Number.isNaN(Number(normalized))) {
    throw new ValidationError({ value: 'Valor inválido.' });
  }
  return new Prisma.Decimal(parseFloat(normalized));
};

const parseDate = (value?: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError({ nextActionAt: 'Data inválida.' });
  }
  return date;
};

export async function GET(
  _request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const user = await requireUser();
    const lead = await assertLeadOwnership(user.id, params.leadId);
    return NextResponse.json({ lead });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = leadUpsertSchema.partial().parse(body);

    const updateData: Record<string, unknown> = {};

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.company !== undefined)
      updateData.company = payload.company || null;
    if (payload.status !== undefined) updateData.status = payload.status || 'open';
    if (payload.priority !== undefined) {
      updateData.priority = payload.priority ?? LeadPriority.MEDIUM;
    }
    if (payload.tags !== undefined) {
      updateData.tags = (payload.tags ?? []).filter(
        (tag) => tag.trim().length > 0
      );
    }
    if (payload.contactEmail !== undefined) {
      updateData.contactEmail = payload.contactEmail || null;
    }
    if (payload.contactPhone !== undefined) {
      updateData.contactPhone = payload.contactPhone || null;
    }
    if (payload.notes !== undefined) updateData.notes = payload.notes || null;
    if (payload.pipelineId !== undefined)
      updateData.pipelineId = payload.pipelineId;
    if (payload.stageId !== undefined) updateData.stageId = payload.stageId;

    if (payload.value !== undefined) {
      updateData.value = parseValue(payload.value) ?? null;
    }

    if (payload.nextActionAt !== undefined) {
      updateData.nextActionAt = parseDate(payload.nextActionAt) ?? null;
    }

    const lead = await updateLead(user.id, params.leadId, updateData as any);

    return NextResponse.json({ lead });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { leadId: string } }
) {
  try {
    const user = await requireUser();
    await deleteLead(user.id, params.leadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
