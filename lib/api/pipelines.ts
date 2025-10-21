import { apiFetch } from '@/lib/api-client';
import type { PipelineWithStages } from '@/types';

export type CreatePipelinePayload = {
  name: string;
  isDefault?: boolean;
};

export type UpdatePipelinePayload = {
  name?: string;
  isDefault?: boolean;
};

export type CreateStagePayload = {
  name: string;
  color: string;
};

export type UpdateStagePayload = {
  name?: string;
  color?: string;
};

export const pipelineApi = {
  list: () =>
    apiFetch<{ pipelines: PipelineWithStages[] }>('/api/pipelines'),
  create: (payload: CreatePipelinePayload) =>
    apiFetch<{ pipeline: PipelineWithStages }>('/api/pipelines', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  update: (id: string, payload: UpdatePipelinePayload) =>
    apiFetch<{ pipeline: PipelineWithStages }>(
      `/api/pipelines/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    ),
  remove: (id: string) =>
    apiFetch<{ success: boolean }>(`/api/pipelines/${id}`, {
      method: 'DELETE'
    }),
  createStage: (pipelineId: string, payload: CreateStagePayload) =>
    apiFetch<{ stage: PipelineWithStages['stages'][number] }>(
      `/api/pipelines/${pipelineId}/stages`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),
  updateStage: (stageId: string, payload: UpdateStagePayload) =>
    apiFetch<{ stage: PipelineWithStages['stages'][number] }>(
      `/api/stages/${stageId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }
    ),
  removeStage: (stageId: string) =>
    apiFetch<{ success: boolean }>(`/api/stages/${stageId}`, {
      method: 'DELETE'
    }),
  reorderStages: (pipelineId: string, stageIds: string[]) =>
    apiFetch<{ stages: PipelineWithStages['stages'] }>(
      '/api/stages/reorder',
      {
        method: 'PATCH',
        body: JSON.stringify({ pipelineId, stageIds })
      }
    )
};
