import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MediaClip } from '../types/media.types';

interface ProjectState {
  clips: MediaClip[];
  selectedClipId: string | null;
  
  addClip: (clip: MediaClip) => void;
  removeClip: (id: string) => void;
  selectClip: (id: string) => void;
  clearSelection: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      clips: [],
      selectedClipId: null,

      addClip: (clip) =>
        set((state) => ({
          clips: [...state.clips, clip],
        })),

      removeClip: (id) =>
        set((state) => {
          const newClips = state.clips.filter((c) => c.id !== id);
          return {
            clips: newClips,
            selectedClipId: state.selectedClipId === id ? null : state.selectedClipId,
          };
        }),

      selectClip: (id) => {
        set({ selectedClipId: id || null });
      },
      
      clearSelection: () => set({ selectedClipId: null }),
    }),
    {
      name: 'clipforge-project', // localStorage key
    }
  )
);

