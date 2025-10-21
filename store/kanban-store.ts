import { create } from 'zustand';

type KanbanState = {
  pipelineId: string | null;
  setPipelineId: (pipelineId: string) => void;
};

export const useKanbanStore = create<KanbanState>((set) => ({
  pipelineId: null,
  setPipelineId: (pipelineId) => set({ pipelineId })
}));
