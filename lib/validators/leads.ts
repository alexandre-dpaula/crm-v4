import { LeadPriority } from '@prisma/client';
import { z } from 'zod';

const priorityValues = Object.values(LeadPriority);

export const leadUpsertSchema = z.object({
  title: z.string().trim().min(2, 'Título obrigatório.'),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  value: z
    .union([
      z.number(),
      z
        .string()
        .trim()
        .regex(/^\d+([.,]\d+)?$/, 'Use apenas números.')
    ])
    .optional()
    .or(z.literal('')),
  status: z.string().trim().max(40).optional().or(z.literal('')),
  priority: z
    .nativeEnum(LeadPriority)
    .optional()
    .default(LeadPriority.MEDIUM)
    .transform((value) => value ?? LeadPriority.MEDIUM),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  contactEmail: z
    .string()
    .trim()
    .email('Email inválido.')
    .optional()
    .or(z.literal('')),
  contactPhone: z
    .string()
    .trim()
    .max(30, 'Telefone inválido.')
    .optional()
    .or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
  nextActionAt: z
    .string()
    .datetime({ message: 'Data inválida.' })
    .optional()
    .or(z.literal('')),
  pipelineId: z.string().min(1, 'Selecione um pipeline.'),
  stageId: z.string().min(1, 'Selecione uma etapa.')
});

export const leadMoveSchema = z.object({
  stageId: z.string().min(1),
  pipelineId: z.string().min(1)
});

export const leadFilterSchema = z.object({
  pipelineId: z.string().optional(),
  search: z.string().optional(),
  priority: z
    .string()
    .optional()
    .refine((value) => !value || priorityValues.includes(value as LeadPriority), {
      message: 'Prioridade inválida.'
    }),
  status: z.string().optional()
});
