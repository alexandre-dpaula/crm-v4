import { z } from 'zod';

export const pipelineSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto.').max(60),
  isDefault: z.boolean().optional()
});

export const stageSchema = z.object({
  name: z.string().trim().min(2).max(60),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Informe uma cor válida.'),
  position: z.number().int().nonnegative()
});

export const reorderStageSchema = z.object({
  pipelineId: z.string().min(1),
  stageIds: z.array(z.string().min(1)).min(1)
});
