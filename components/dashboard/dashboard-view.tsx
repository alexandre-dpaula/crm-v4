'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Settings, Edit3, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { pipelineApi } from '@/lib/api/pipelines';
import { leadApi } from '@/lib/api/leads';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LeadModal } from '@/components/leads/lead-modal';
import type {
  LeadWithRelations,
  PipelineWithStages
} from '@/types';
import { LeadCard } from '@/components/leads/lead-card';
import { useKanbanStore } from '@/store/kanban-store';

export function DashboardView() {
  const queryClient = useQueryClient();
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeLead, setActiveLead] = useState<LeadWithRelations | undefined>(
    undefined
  );

  const { data: pipelinesData, isLoading: pipelinesLoading } = useQuery({
    queryKey: ['pipelines'],
    queryFn: pipelineApi.list
  });

  const pipelineId = useKanbanStore((state) => state.pipelineId);
  const setPipelineId = useKanbanStore((state) => state.setPipelineId);

  const pipelines = pipelinesData?.pipelines ?? [];

  useEffect(() => {
    if (!pipelinesLoading && pipelines.length > 0 && !pipelineId) {
      setPipelineId(pipelines[0].id);
    }
  }, [pipelines, pipelinesLoading, pipelineId, setPipelineId]);

  useEffect(() => {
    if (pipelineId && !pipelines.some((pipeline) => pipeline.id === pipelineId) && pipelines.length > 0) {
      setPipelineId(pipelines[0].id);
    }
  }, [pipelineId, pipelines, setPipelineId]);

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ['leads', { pipelineId }],
    queryFn: () => leadApi.list({ pipelineId: pipelineId ?? undefined }),
    enabled: Boolean(pipelineId)
  });

  const leads = leadsData?.leads ?? [];

  const leadsByStage = useMemo(() => {
    const map = new Map<string, LeadWithRelations[]>();
    leads.forEach((lead) => {
      const key = lead.stageId ?? 'unassigned';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(lead);
    });
    return map;
  }, [leads]);

  const selectedPipeline = pipelines.find(
    (pipeline) => pipeline.id === pipelineId
  );

  const openCreateLead = () => {
    setModalMode('create');
    setActiveLead(undefined);
    setLeadModalOpen(true);
  };

  const openEditLead = (lead: LeadWithRelations) => {
    setModalMode('edit');
    setActiveLead(lead);
    setLeadModalOpen(true);
  };

  const deleteLeadMutation = useMutation({
    mutationFn: (leadId: string) => leadApi.remove(leadId),
    onSuccess: () => {
      toast.success('Lead excluído.');
      queryClient.invalidateQueries({
        queryKey: ['leads']
      });
    },
    onError: () => {
      toast.error('Não foi possível excluir o lead.');
    }
  });

  const moveLeadMutation = useMutation({
    mutationFn: ({
      leadId,
      stageId
    }: {
      leadId: string;
      stageId: string;
    }) =>
      leadApi.move(leadId, {
        pipelineId: pipelineId ?? '',
        stageId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: () => {
      toast.error('Não foi possível mover o lead.');
    }
  });

  const renameStageMutation = useMutation({
    mutationFn: ({
      stageId,
      name
    }: {
      stageId: string;
      name: string;
    }) => pipelineApi.updateStage(stageId, { name }),
    onSuccess: () => {
      toast.success('Etapa atualizada.');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.body?.error ?? 'Não foi possível renomear a etapa.'
      );
    }
  });

  const deleteStageMutation = useMutation({
    mutationFn: (stageId: string) => pipelineApi.removeStage(stageId),
    onSuccess: () => {
      toast.success('Etapa removida.');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error: any) => {
      toast.error(
        error?.body?.error ?? 'Não foi possível remover a etapa.'
      );
    }
  });

  const reorderStagesMutation = useMutation({
    mutationFn: ({
      pipelineId,
      stageIds
    }: {
      pipelineId: string;
      stageIds: string[];
    }) => pipelineApi.reorderStages(pipelineId, stageIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: () => {
      toast.error('Não foi possível reordenar as etapas.');
    }
  });

  const createStageMutation = useMutation({
    mutationFn: ({
      pipelineId,
      name,
      color
    }: {
      pipelineId: string;
      name: string;
      color: string;
    }) => pipelineApi.createStage(pipelineId, { name, color }),
    onSuccess: () => {
      toast.success('Etapa adicionada.');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: () => {
      toast.error('Não foi possível criar a etapa.');
    }
  });

  const createPipelineMutation = useMutation({
    mutationFn: (name: string) =>
      pipelineApi.create({
        name
      }),
    onSuccess: (data) => {
      toast.success('Pipeline criado.');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setPipelineId(data.pipeline.id);
    },
    onError: () => {
      toast.error('Não foi possível criar o pipeline.');
    }
  });

  const updatePipelineMutation = useMutation({
    mutationFn: ({
      pipelineId,
      name
    }: {
      pipelineId: string;
      name: string;
    }) => pipelineApi.update(pipelineId, { name }),
    onSuccess: () => {
      toast.success('Pipeline atualizado.');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
    },
    onError: () => {
      toast.error('Não foi possível atualizar o pipeline.');
    }
  });

  const deletePipelineMutation = useMutation({
    mutationFn: (pipelineId: string) => pipelineApi.remove(pipelineId),
    onSuccess: () => {
      toast.success('Pipeline removido.');
      queryClient.invalidateQueries({ queryKey: ['pipelines'] });
      setPipelineId(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.body?.error ?? 'Não foi possível excluir o pipeline.'
      );
    }
  });

  const handleDeleteLead = (lead: LeadWithRelations) => {
    if (
      window.confirm(`Tem certeza que deseja excluir o lead "${lead.title}"?`)
    ) {
      deleteLeadMutation.mutate(lead.id);
    }
  };

  const handleRenameStage = (stageId: string) => {
    const currentStage = selectedPipeline?.stages.find(
      (stage) => stage.id === stageId
    );
    if (!currentStage) return;
    const newName = window.prompt(
      'Novo nome para a etapa:',
      currentStage.name
    );
    if (!newName) return;
    renameStageMutation.mutate({ stageId, name: newName });
  };

  const handleDeleteStage = (stageId: string) => {
    const stage = selectedPipeline?.stages.find((s) => s.id === stageId);
    if (
      stage &&
      window.confirm(
        `Excluir a etapa "${stage.name}"? Os leads ficarão sem etapa.`
      )
    ) {
      deleteStageMutation.mutate(stageId);
    }
  };

  const handleMoveStage = (stageId: string, direction: 'left' | 'right') => {
    if (!selectedPipeline) return;
    const currentIndex = selectedPipeline.stages.findIndex(
      (stage) => stage.id === stageId
    );
    if (currentIndex === -1) return;
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= selectedPipeline.stages.length) return;

    const stageOrder = [...selectedPipeline.stages];
    const [stage] = stageOrder.splice(currentIndex, 1);
    stageOrder.splice(targetIndex, 0, stage);
    reorderStagesMutation.mutate({
      pipelineId: selectedPipeline.id,
      stageIds: stageOrder.map((s) => s.id)
    });
  };

  const handleCreateStage = () => {
    if (!selectedPipeline) return;
    const name = window.prompt('Nome da nova etapa:');
    if (!name) return;
    const color =
      window.prompt('Cor hexadecimal (ex: #2563eb):', '#2563eb') ?? '#2563eb';
    createStageMutation.mutate({
      pipelineId: selectedPipeline.id,
      name,
      color
    });
  };

  const handleMoveLead = (lead: LeadWithRelations, stageId: string) => {
    if (!pipelineId || !stageId) return;
    moveLeadMutation.mutate({ leadId: lead.id, stageId });
  };

  const handlePipelineChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPipelineId(event.target.value);
  };

  const handleCreatePipeline = () => {
    const name = window.prompt('Nome do novo pipeline:');
    if (!name) return;
    createPipelineMutation.mutate(name);
  };

  const handleRenamePipeline = () => {
    if (!selectedPipeline) return;
    const name = window.prompt('Novo nome do pipeline:', selectedPipeline.name);
    if (!name) return;
    updatePipelineMutation.mutate({ pipelineId: selectedPipeline.id, name });
  };

  const handleDeletePipeline = () => {
    if (!selectedPipeline) return;
    if (
      window.confirm(
        `Tem certeza que deseja excluir o pipeline "${selectedPipeline.name}"?`
      )
    ) {
      deletePipelineMutation.mutate(selectedPipeline.id);
    }
  };

  if (pipelinesLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Carregando seus pipelines...
      </div>
    );
  }

  if (!selectedPipeline) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Configure seu primeiro pipeline
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Crie um pipeline para começar a organizar seus leads.
          </p>
          <Button type="button" className="mt-4" onClick={handleCreatePipeline}>
            <Plus size={16} className="mr-2" />
            Novo pipeline
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Pipeline
            </p>
            <div className="flex items-center gap-2">
              <select
                value={pipelineId ?? ''}
                onChange={handlePipelineChange}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                {pipelines.map((pipeline) => (
                  <option key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </option>
                ))}
              </select>
              <Badge variant={selectedPipeline?.isDefault ? 'success' : 'default'}>
                {selectedPipeline?.isDefault ? 'Principal' : 'Secundário'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCreatePipeline}
            >
              <Plus size={16} className="mr-1" />
              Novo pipeline
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRenamePipeline}
              disabled={!selectedPipeline}
            >
              <Settings size={16} className="mr-1" />
              Renomear
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={handleDeletePipeline}
              disabled={!selectedPipeline || pipelines.length <= 1}
            >
              <Trash2 size={16} className="mr-1" />
              Excluir
            </Button>
          </div>
        </div>
        <Button type="button" onClick={openCreateLead}>
          <Plus size={16} className="mr-2" />
          Novo lead
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-900">
            Total de leads no pipeline
          </p>
          <p className="text-2xl font-semibold text-slate-900">
            {leads.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCreateStage}
            disabled={!selectedPipeline}
          >
            <Plus size={16} className="mr-1" />
            Nova etapa
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex min-h-[60vh] gap-4">
          {selectedPipeline?.stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex min-w-[280px] flex-col rounded-xl border border-slate-200 bg-slate-50"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {stage.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {leadsByStage.get(stage.id)?.length ?? 0} leads
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-500 hover:bg-slate-200"
                    onClick={() => handleMoveStage(stage.id, 'left')}
                    disabled={index === 0}
                    title="Mover para esquerda"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-500 hover:bg-slate-200"
                    onClick={() => handleMoveStage(stage.id, 'right')}
                    disabled={index === (selectedPipeline?.stages.length ?? 0) - 1}
                    title="Mover para direita"
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-slate-500 hover:bg-slate-200"
                    onClick={() => handleRenameStage(stage.id)}
                    title="Editar etapa"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    className="rounded-md p-1 text-red-500 hover:bg-red-50"
                    onClick={() => handleDeleteStage(stage.id)}
                    title="Excluir etapa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                {leadsLoading ? (
                  <p className="text-sm text-slate-500">Carregando leads...</p>
                ) : (
                  (leadsByStage.get(stage.id) ?? []).map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      pipelines={pipelines}
                      onEdit={openEditLead}
                      onDelete={handleDeleteLead}
                      onMove={handleMoveLead}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
          {selectedPipeline?.stages.length === 0 ? (
            <div className="flex h-full min-w-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500">
              <p className="font-medium">Nenhuma etapa cadastrada</p>
              <p className="mt-2 text-sm">
                Crie a primeira etapa para começar a organizar seus leads.
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={handleCreateStage}
              >
                Adicionar etapa
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <LeadModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        mode={modalMode}
        pipelines={pipelines}
        lead={activeLead}
        onSuccess={(_lead) => {
          queryClient.invalidateQueries({ queryKey: ['leads'] });
        }}
      />
    </div>
  );
}
