'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { pipelineApi } from '@/lib/api/pipelines';
import { leadApi } from '@/lib/api/leads';
import { Button } from '@/components/ui/button';
import { LeadModal } from '@/components/leads/lead-modal';
import type { LeadWithRelations } from '@/types';

export function LeadsTableView() {
  const queryClient = useQueryClient();
  const [pipelineFilter, setPipelineFilter] = useState<string | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<LeadWithRelations | undefined>(
    undefined
  );

  const { data: pipelinesData } = useQuery({
    queryKey: ['pipelines'],
    queryFn: pipelineApi.list
  });
  const pipelines = pipelinesData?.pipelines ?? [];

  const { data: leadsData } = useQuery({
    queryKey: ['leads', { pipelineId: pipelineFilter }],
    queryFn: () =>
      leadApi.list({
        pipelineId: pipelineFilter === 'all' ? undefined : pipelineFilter
      })
  });
  const leads = leadsData?.leads ?? [];

  const deleteMutation = useMutation({
    mutationFn: (leadId: string) => leadApi.remove(leadId),
    onSuccess: () => {
      toast.success('Lead removido.');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      toast.error('Não foi possível remover o lead.');
    }
  });

  const openEdit = (lead: LeadWithRelations) => {
    setActiveLead(lead);
    setModalOpen(true);
  };

  const onCreate = () => {
    setActiveLead(undefined);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Leads cadastrados
          </h1>
          <p className="text-sm text-slate-500">
            Visualize seus leads em formato de tabela.
          </p>
        </div>
        <Button type="button" onClick={onCreate}>
          Novo lead
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 pb-4">
          <label className="text-sm text-slate-600">
            Pipeline:{' '}
            <select
              value={pipelineFilter}
              onChange={(event) =>
                setPipelineFilter(event.target.value as string | 'all')
              }
              className="ml-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
            >
              <option value="all">Todos</option>
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          </label>
          <span className="text-sm text-slate-500">
            {leads.length} resultados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Lead
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Empresa
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Pipeline / Etapa
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Valor
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-600">
                  Prioridade
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="px-4 py-3 text-slate-900">{lead.title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.company ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="flex flex-col">
                      <span>{lead.pipeline.name}</span>
                      <span className="text-xs text-slate-400">
                        {lead.stage?.name ?? 'Sem etapa'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.value
                      ? `R$ ${Number(lead.value).toLocaleString('pt-BR')}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{lead.priority}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(lead)}
                      >
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Excluir o lead "${lead.title}"?`
                            )
                          ) {
                            deleteMutation.mutate(lead.id);
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum lead encontrado. Crie um novo para começar.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <LeadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={activeLead ? 'edit' : 'create'}
        pipelines={pipelines}
        lead={activeLead}
        onSuccess={(_lead) => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }}
      />
    </div>
  );
}
