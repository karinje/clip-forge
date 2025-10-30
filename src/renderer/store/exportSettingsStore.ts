import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  durationMode: 'main' | 'shortest' | 'longest';
  pipPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  pipScale: number; // 0.1 to 0.5
}

interface ExportSettingsStore {
  settings: ExportSettings;
  updateSettings: (settings: Partial<ExportSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: ExportSettings = {
  format: 'mp4',
  quality: 'high',
  durationMode: 'main',
  pipPosition: 'bottom-right',
  pipScale: 0.25,
};

export const useExportSettingsStore = create<ExportSettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      resetSettings: () =>
        set({ settings: defaultSettings }),
    }),
    {
      name: 'clipforge-export-settings',
    }
  )
);

