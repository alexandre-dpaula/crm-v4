import { apiFetch } from '@/lib/api-client';
import type {
  LeadActivityWithActor,
  LeadWithRelations
} from '@/types';

export type LeadInput = {
  title: string;
  company?: string;
  value?: string | number | null;
  status?: string;
  priority?: string;
  tags?: string[];
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  nextActionAt?: string | null;
  pipelineId: string;
  stageId: string;
};

export type LeadFilters = {
  pipelineId?: string;
  search?: string;
  priority?: string;
  status?: string;
};

const serialize = (params: Record<string, string | undefined>) =>
  Object.entries(params)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value!)}`)
    .join('&');

export const leadApi = {
  list: (filters: LeadFilters = {}) => {
    const query = serialize({
      pipelineId: filters.pipelineId,
      search: filters.search,
      priority: filters.priority,
      status: filters.status
    });
    const url = query ? `/api/leads?${query}` : '/api/leads';
    return apiFetch<{ leads: LeadWithRelations[] }>(url);
  },
  create: (payload: LeadInput) =>
    apiFetch<{ lead: LeadWithRelations }>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  update: (leadId: string, payload: Partial<LeadInput>) =>
    apiFetch<{ lead: LeadWithRelations }>(`/api/leads/${leadId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),
  remove: (leadId: string) =>
    apiFetch<{ success: boolean }>(`/api/leads/${leadId}`, {
      method: 'DELETE'
    }),
  move: (leadId: string, payload: { pipelineId: string; stageId: string }) =>
    apiFetch<{ lead: LeadWithRelations }>(`/api/leads/${leadId}/move`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  activity: (leadId: string) =>
    apiFetch<{ activity: LeadActivityWithActor[] }>(
      `/api/leads/${leadId}/activity`
    )
};
