import {
  LeadActivityType,
  type Lead,
  type Prisma
} from '@prisma/client';
import { ForbiddenError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

const leadInclude = {
  stage: true,
  pipeline: {
    select: {
      id: true,
      name: true
    }
  }
} satisfies Prisma.LeadInclude;

async function assertPipeline(userId: string, pipelineId: string) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
    select: { id: true, userId: true }
  });
  if (!pipeline) {
    throw new NotFoundError('Pipeline não encontrado.');
  }
  if (pipeline.userId !== userId) {
    throw new ForbiddenError();
  }
  return pipeline;
}

async function assertStage(userId: string, stageId: string) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { pipeline: true }
  });
  if (!stage) {
    throw new NotFoundError('Etapa não encontrada.');
  }
  if (stage.pipeline.userId !== userId) {
    throw new ForbiddenError();
  }
  return stage;
}

export async function listLeads(
  userId: string,
  filters: {
    pipelineId?: string;
    search?: string;
    priority?: Lead['priority'];
    status?: string;
  } = {}
) {
  const where: Prisma.LeadWhereInput = {
    userId,
    archivedAt: null
  };

  if (filters.pipelineId) where.pipelineId = filters.pipelineId;
  if (filters.priority) where.priority = filters.priority;
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { company: { contains: filters.search, mode: 'insensitive' } },
      { contactEmail: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  return prisma.lead.findMany({
    where,
    include: leadInclude,
    orderBy: [
      { stage: { position: 'asc' } },
      { updatedAt: 'desc' }
    ]
  });
}

export async function createLead(
  userId: string,
  data: Omit<Lead, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'archivedAt'>
) {
  const pipeline = await assertPipeline(userId, data.pipelineId);
  let stageId = data.stageId ?? null;
  if (data.stageId) {
    const stage = await assertStage(userId, data.stageId);
    if (stage.pipelineId !== pipeline.id) {
      throw new ForbiddenError('Etapa não pertence ao pipeline selecionado.');
    }
    stageId = stage.id;
  }

  const lead = await prisma.lead.create({
    data: {
      ...data,
      stageId,
      userId
    },
    include: leadInclude
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      actorUserId: userId,
      type: LeadActivityType.CREATE,
      payload: {
        title: lead.title,
        pipelineId: lead.pipelineId,
        stageId: lead.stageId
      }
    }
  });

  return lead;
}

export async function assertLeadOwnership(userId: string, leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: leadInclude
  });

  if (!lead) {
    throw new NotFoundError('Lead não encontrado.');
  }
  if (lead.userId !== userId) {
    throw new ForbiddenError();
  }
  return lead;
}

export async function updateLead(
  userId: string,
  leadId: string,
  data: Partial<Lead>
) {
  const currentLead = await assertLeadOwnership(userId, leadId);

  if (data.pipelineId && data.pipelineId !== currentLead.pipelineId) {
    await assertPipeline(userId, data.pipelineId);
  }
  if (data.stageId && data.stageId !== currentLead.stageId) {
    const stage = await assertStage(userId, data.stageId);
    const targetPipeline = data.pipelineId ?? currentLead.pipelineId;
    if (stage.pipelineId !== targetPipeline) {
      throw new ForbiddenError('Etapa não pertence ao pipeline selecionado.');
    }
  }

  const lead = await prisma.lead.update({
    where: { id: currentLead.id },
    data,
    include: leadInclude
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      actorUserId: userId,
      type: LeadActivityType.UPDATE,
      payload: {
        before: {
          stageId: currentLead.stageId,
          pipelineId: currentLead.pipelineId,
          title: currentLead.title
        },
        after: {
          stageId: lead.stageId,
          pipelineId: lead.pipelineId,
          title: lead.title
        }
      }
    }
  });

  return lead;
}

export async function deleteLead(userId: string, leadId: string) {
  const lead = await assertLeadOwnership(userId, leadId);

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      actorUserId: userId,
      type: LeadActivityType.DELETE,
      payload: {
        title: lead.title
      }
    }
  });

  await prisma.lead.delete({ where: { id: lead.id } });
}

export async function moveLead(
  userId: string,
  leadId: string,
  payload: { pipelineId: string; stageId: string | null }
) {
  const current = await assertLeadOwnership(userId, leadId);

  const pipeline = await assertPipeline(userId, payload.pipelineId);
  let stageId = payload.stageId;
  if (payload.stageId) {
    const stage = await assertStage(userId, payload.stageId);
    if (stage.pipelineId !== pipeline.id) {
      throw new ForbiddenError('Etapa não pertence ao pipeline selecionado.');
    }
    stageId = stage.id;
  }

  const lead = await prisma.lead.update({
    where: { id: current.id },
    data: {
      pipelineId: payload.pipelineId,
      stageId
    },
    include: leadInclude
  });

  await prisma.leadActivity.create({
    data: {
      leadId: lead.id,
      actorUserId: userId,
      type: LeadActivityType.MOVE,
      payload: {
        from: {
          pipelineId: current.pipelineId,
          stageId: current.stageId
        },
        to: {
          pipelineId: lead.pipelineId,
          stageId: lead.stageId
        }
      }
    }
  });

  return lead;
}

export async function getLeadActivity(userId: string, leadId: string) {
  await assertLeadOwnership(userId, leadId);

  return prisma.leadActivity.findMany({
    where: { leadId },
    include: {
      actor: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}
