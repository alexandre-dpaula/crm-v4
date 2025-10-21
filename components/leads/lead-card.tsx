'use client';

import {
  Calendar,
  Mail,
  Phone,
  Tags,
  Pencil,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LeadWithRelations, PipelineWithStages } from '@/types';
import { cn } from '@/lib/utils';

const priorityVariant: Record<
  'LOW' | 'MEDIUM' | 'HIGH' | 'HOT',
  'default' | 'success' | 'warning' | 'danger'
> = {
  LOW: 'default',
  MEDIUM: 'success',
  HIGH: 'warning',
  HOT: 'danger'
};

type LeadCardProps = {
  lead: LeadWithRelations;
  pipelines: PipelineWithStages[];
  onEdit: (lead: LeadWithRelations) => void;
  onDelete: (lead: LeadWithRelations) => void;
  onMove: (lead: LeadWithRelations, stageId: string) => void;
};

export function LeadCard({
  lead,
  pipelines,
  onEdit,
  onDelete,
  onMove
}: LeadCardProps) {
  const pipelineStages =
    pipelines.find((pipeline) => pipeline.id === lead.pipelineId)?.stages ?? [];

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            {lead.title}
          </h4>
          {lead.company ? (
            <p className="text-sm text-slate-500">{lead.company}</p>
          ) : null}
        </div>
        <Badge variant={priorityVariant[lead.priority]}>
          {lead.priority}
        </Badge>
      </div>
      <div className="mt-3 space-y-2 text-xs text-slate-600">
        {lead.value ? (
          <p className="font-medium text-slate-700">
            Valor potencial: R$ {Number(lead.value).toLocaleString('pt-BR')}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <ArrowRight size={14} className="text-slate-400" />
          <span>{lead.pipeline.name}</span>
        </div>
        {lead.contactEmail ? (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            <a href={`mailto:${lead.contactEmail}`} className="hover:text-brand">
              {lead.contactEmail}
            </a>
          </div>
        ) : null}
        {lead.contactPhone ? (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400" />
            <span>{lead.contactPhone}</span>
          </div>
        ) : null}
        {lead.nextActionAt ? (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span>
              Próxima ação:{' '}
              {new Date(lead.nextActionAt).toLocaleString('pt-BR')}
            </span>
          </div>
        ) : null}
        {Array.isArray(lead.tags) && lead.tags.length > 0 ? (
          <div className="flex items-center gap-2">
            <Tags size={14} className="text-slate-400" />
            <div className="flex flex-wrap gap-1">
              {lead.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-center gap-2">
        <select
          className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40"
          value={lead.stageId ?? ''}
          onChange={(event) => onMove(lead, event.target.value)}
        >
          <option value="">Selecione etapa</option>
          {pipelineStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              Mover para: {stage.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(lead)}
          className="px-2 text-xs"
        >
          <Pencil size={14} className="mr-1" />
          Editar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn('px-2 text-xs text-red-600 hover:bg-red-50')}
          onClick={() => onDelete(lead)}
        >
          <Trash2 size={14} className="mr-1" />
          Excluir
        </Button>
      </div>
    </div>
  );
}
