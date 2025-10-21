import { Prisma, type Lead } from '@prisma/client';
import { NextResponse } from 'next/server';
import { handleRouteError } from '@/lib/http';
import { requireUser } from '@/lib/auth';
import { leadFilterSchema, leadUpsertSchema } from '@/lib/validators/leads';
import { createLead, listLeads } from '@/lib/services/leads';
import { ValidationError } from '@/lib/errors';

const parseValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return new Prisma.Decimal(value);
  }
  const normalized = value.replace(',', '.');
  if (Number.isNaN(Number(normalized))) {
    throw new ValidationError({ value: 'Valor inválido.' });
  }
  return new Prisma.Decimal(parseFloat(normalized));
};

const parseTags = (tags?: string[] | null) => {
  if (!tags) return [];
  return tags.filter((tag) => tag.trim().length > 0);
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError({ nextActionAt: 'Data inválida.' });
  }
  return date;
};

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const url = new URL(request.url);
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const filters = leadFilterSchema.parse(searchParams);

    const leads = await listLeads(user.id, {
      pipelineId: filters.pipelineId,
      priority: filters.priority as Lead['priority'] | undefined,
      status: filters.status,
      search: filters.search
    });

    return NextResponse.json({ leads });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const payload = leadUpsertSchema.parse(body);

    const lead = await createLead(user.id, {
      title: payload.title,
      company: payload.company || null,
      value: parseValue(payload.value),
      status: payload.status || 'open',
      priority: (payload.priority as Lead['priority']) ?? 'MEDIUM',
      tags: parseTags(payload.tags),
      contactEmail: payload.contactEmail || null,
      contactPhone: payload.contactPhone || null,
      notes: payload.notes || null,
      nextActionAt: parseDate(payload.nextActionAt),
      pipelineId: payload.pipelineId,
      stageId: payload.stageId
    });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
