'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { leadUpsertSchema } from '@/lib/validators/leads';
import { useMutation } from '@tanstack/react-query';
import { leadApi } from '@/lib/api/leads';
import type { LeadWithRelations, PipelineWithStages } from '@/types';

type FormValues = Omit<
  z.infer<typeof leadUpsertSchema>,
  'value' | 'tags' | 'nextActionAt'
> & {
  value: string;
  tags: string;
  nextActionAt: string;
};

type LeadModalProps = {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  pipelines: PipelineWithStages[];
  lead?: LeadWithRelations;
  onSuccess: (lead: LeadWithRelations) => void;
};

const defaultValues: FormValues = {
  title: '',
  company: '',
  value: '',
  status: 'open',
  priority: 'MEDIUM',
  tags: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
  nextActionAt: '',
  pipelineId: '',
  stageId: ''
};

export function LeadModal({
  open,
  onClose,
  mode,
  pipelines,
  lead,
  onSuccess
}: LeadModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      leadUpsertSchema.extend({
        value: z.string().optional(),
        tags: z.string().optional(),
        nextActionAt: z.string().optional()
      })
    ),
    defaultValues
  });

  const selectedPipeline = form.watch('pipelineId');

  const stages = useMemo(() => {
    return (
      pipelines.find((pipeline) => pipeline.id === selectedPipeline)?.stages ??
      []
    );
  }, [pipelines, selectedPipeline]);

  const hasStages = stages.length > 0;

  useEffect(() => {
    if (open) {
      const pipelineId =
        lead?.pipelineId ?? pipelines[0]?.id ?? defaultValues.pipelineId;
      const stageId =
        lead?.stageId ??
        pipelines.find((pipeline) => pipeline.id === pipelineId)?.stages?.[0]
          ?.id ??
        '';

      form.reset({
        title: lead?.title ?? '',
        company: lead?.company ?? '',
        value: lead?.value ? String(lead.value) : '',
        status: lead?.status ?? 'open',
        priority: lead?.priority ?? 'MEDIUM',
        tags: Array.isArray(lead?.tags) ? lead?.tags.join(', ') : '',
        contactEmail: lead?.contactEmail ?? '',
        contactPhone: lead?.contactPhone ?? '',
        notes: lead?.notes ?? '',
        nextActionAt: lead?.nextActionAt
          ? new Date(lead.nextActionAt).toISOString().slice(0, 16)
          : '',
        pipelineId,
        stageId: stageId ?? ''
      });
    }
  }, [form, open, lead, pipelines]);

  useEffect(() => {
    if (!selectedPipeline && pipelines.length > 0) {
      form.setValue('pipelineId', pipelines[0].id);
      form.setValue('stageId', pipelines[0].stages[0]?.id ?? '');
    }
  }, [form, pipelines, selectedPipeline]);

  useEffect(() => {
    if (stages.length > 0) {
      const currentStage = form.getValues('stageId');
      const exists = stages.some((stage) => stage.id === currentStage);
      if (!exists) {
        form.setValue('stageId', stages[0].id);
      }
    }
  }, [form, stages]);

  const mutation = useMutation({
    mutationFn: (payload: z.infer<typeof leadUpsertSchema>) => {
      if (mode === 'create') {
        return leadApi.create(payload);
      }
      if (!lead) {
        throw new Error('Lead não encontrado.');
      }
      return leadApi.update(lead.id, payload);
    },
    onSuccess: (response) => {
      const savedLead = 'lead' in response ? response.lead : (response as any).lead;
      onSuccess(savedLead);
      toast.success(
        mode === 'create' ? 'Lead criado com sucesso!' : 'Lead atualizado.'
      );
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.body?.error ?? 'Não foi possível salvar o lead.';
      toast.error(message);
    }
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      value: values.value,
      tags: values.tags
        ? values.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
      nextActionAt: values.nextActionAt
        ? new Date(values.nextActionAt).toISOString()
        : ''
    };
    if (!hasStages) {
      toast.error('Crie ao menos uma etapa nesse pipeline antes de adicionar leads.');
      return;
    }
    mutation.mutate(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Novo lead' : 'Editar lead'}
      className="max-w-2xl"
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...form.register('title')} />
            {form.formState.errors.title ? (
              <p className="mt-1 text-sm text-red-600">
                {form.formState.errors.title.message as string}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="pipelineId">Pipeline</Label>
            <Select id="pipelineId" {...form.register('pipelineId')}>
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="stageId">Etapa</Label>
            <Select id="stageId" {...form.register('stageId')}>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" {...form.register('company')} />
          </div>
          <div>
            <Label htmlFor="value">Valor potencial (R$)</Label>
            <Input id="value" {...form.register('value')} />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input id="status" {...form.register('status')} />
          </div>
          <div>
            <Label htmlFor="priority">Prioridade</Label>
            <Select id="priority" {...form.register('priority')}>
              {['LOW', 'MEDIUM', 'HIGH', 'HOT'].map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="contactEmail">Email do contato</Label>
            <Input
              id="contactEmail"
              type="email"
              {...form.register('contactEmail')}
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Telefone</Label>
            <Input id="contactPhone" {...form.register('contactPhone')} />
          </div>
          <div>
            <Label htmlFor="nextActionAt">Próxima ação</Label>
            <Input
              id="nextActionAt"
              type="datetime-local"
              {...form.register('nextActionAt')}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="tags">Tags (separe por vírgula)</Label>
            <Input id="tags" {...form.register('tags')} placeholder="Compras, Demo" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea id="notes" rows={4} {...form.register('notes')} />
          </div>
        </div>
        {!hasStages ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Este pipeline não possui etapas. Crie uma etapa no Kanban antes de adicionar novos leads.
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!hasStages || mutation.isPending}
          >
            {mode === 'create' ? 'Criar lead' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
