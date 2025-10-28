import { create } from 'zustand';
import { MediaClip } from '../types/media.types';

interface ProjectState {
  clips: MediaClip[];
  selectedClipId: string | null;
  
  addClip: (clip: MediaClip) => void;
  removeClip: (id: string) => void;
  selectClip: (id: string) => void;
  clearSelection: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  clips: [],
  selectedClipId: null,

  addClip: (clip) =>
    set((state) => ({
      clips: [...state.clips, clip],
    })),

  removeClip: (id) =>
    set((state) => ({
      clips: state.clips.filter((c) => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
    })),

  selectClip: (id) => set({ selectedClipId: id }),
  
  clearSelection: () => set({ selectedClipId: null }),
}));

