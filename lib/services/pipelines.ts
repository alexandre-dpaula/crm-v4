import { ForbiddenError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import type { Pipeline, Stage } from '@prisma/client';

export async function listPipelines(userId: string) {
  return prisma.pipeline.findMany({
    where: { userId },
    include: {
      stages: {
        orderBy: { position: 'asc' }
      }
    },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
  });
}

export async function createPipeline(
  userId: string,
  data: Pick<Pipeline, 'name'> & { makeDefault?: boolean }
) {
  const pipelineCount = await prisma.pipeline.count({
    where: { userId }
  });

  return prisma.pipeline.create({
    data: {
      name: data.name,
      userId,
      isDefault: data.makeDefault ?? pipelineCount === 0,
      stages: {
        create: [
          { name: 'Novos', position: 0, color: '#2563eb' },
          { name: 'Contato iniciado', position: 1, color: '#0ea5e9' },
          { name: 'Qualificado', position: 2, color: '#22c55e' }
        ]
      }
    },
    include: {
      stages: {
        orderBy: { position: 'asc' }
      }
    }
  });
}

export async function assertPipelineOwnership(
  userId: string,
  pipelineId: string
) {
  const pipeline = await prisma.pipeline.findUnique({
    where: { id: pipelineId },
    select: { id: true, userId: true, isDefault: true }
  });

  if (!pipeline) {
    throw new NotFoundError('Pipeline não encontrado.');
  }

  if (pipeline.userId !== userId) {
    throw new ForbiddenError();
  }

  return pipeline;
}

export async function updatePipeline(
  userId: string,
  pipelineId: string,
  data: Partial<Pick<Pipeline, 'name' | 'isDefault'>>
) {
  const pipeline = await assertPipelineOwnership(userId, pipelineId);

  if (data.isDefault) {
    await prisma.pipeline.updateMany({
      where: { userId, NOT: { id: pipelineId } },
      data: { isDefault: false }
    });
  }

  return prisma.pipeline.update({
    where: { id: pipeline.id },
    data: {
      name: data.name,
      isDefault: data.isDefault ?? pipeline.isDefault
    },
    include: {
      stages: {
        orderBy: { position: 'asc' }
      }
    }
  });
}

export async function deletePipeline(userId: string, pipelineId: string) {
  const pipeline = await assertPipelineOwnership(userId, pipelineId);

  const pipelineCount = await prisma.pipeline.count({
    where: { userId }
  });

  if (pipelineCount <= 1) {
    throw new ForbiddenError(
      'Mantenha pelo menos um pipeline ativo para sua conta.'
    );
  }

  if (pipeline.isDefault) {
    throw new ForbiddenError('Defina outro pipeline como principal antes.');
  }

  await prisma.pipeline.delete({ where: { id: pipeline.id } });
}

export async function createStage(
  userId: string,
  pipelineId: string,
  data: Pick<Stage, 'name' | 'color'>
) {
  const pipeline = await assertPipelineOwnership(userId, pipelineId);

  const maxPosition = await prisma.stage.aggregate({
    where: { pipelineId: pipeline.id },
    _max: { position: true }
  });

  const nextPosition = (maxPosition._max.position ?? -1) + 1;

  return prisma.stage.create({
    data: {
      name: data.name,
      color: data.color,
      position: nextPosition,
      pipelineId: pipeline.id
    }
  });
}

export async function updateStage(
  userId: string,
  stageId: string,
  data: Partial<Pick<Stage, 'name' | 'color'>>
) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    select: { id: true, pipelineId: true, pipeline: { select: { userId: true } } }
  });

  if (!stage) {
    throw new NotFoundError('Etapa não encontrada.');
  }

  if (stage.pipeline.userId !== userId) {
    throw new ForbiddenError();
  }

  return prisma.stage.update({
    where: { id: stage.id },
    data: {
      name: data.name,
      color: data.color
    }
  });
}

export async function deleteStage(userId: string, stageId: string) {
  const stage = await prisma.stage.findUnique({
    where: { id: stageId },
    include: { pipeline: { select: { userId: true } } }
  });

  if (!stage) {
    throw new NotFoundError('Etapa não encontrada.');
  }

  if (stage.pipeline.userId !== userId) {
    throw new ForbiddenError();
  }

  const stageCount = await prisma.stage.count({
    where: { pipelineId: stage.pipelineId }
  });

  if (stageCount <= 1) {
    throw new ForbiddenError(
      'Mantenha pelo menos uma etapa configurada no pipeline.'
    );
  }

  await prisma.$transaction([
    prisma.lead.updateMany({
      where: { stageId: stage.id },
      data: { stageId: null }
    }),
    prisma.stage.delete({ where: { id: stage.id } })
  ]);
}

export async function reorderStages(
  userId: string,
  pipelineId: string,
  stageIds: string[]
) {
  const pipeline = await assertPipelineOwnership(userId, pipelineId);

  const stages = await prisma.stage.findMany({
    where: { pipelineId: pipeline.id },
    select: { id: true }
  });

  const stageSet = new Set(stages.map((stage) => stage.id));
  const valid = stageIds.every((id) => stageSet.has(id));
  if (!valid || stageIds.length !== stages.length) {
    throw new ForbiddenError('Ordem inválida.');
  }

  await prisma.$transaction(
    stageIds.map((id, index) =>
      prisma.stage.update({
        where: { id },
        data: { position: index }
      })
    )
  );

  return prisma.stage.findMany({
    where: { pipelineId: pipeline.id },
    orderBy: { position: 'asc' }
  });
}
