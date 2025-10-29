import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TimelineClip {
  id: string;
  mediaClipId: string; // Reference to imported media
  startTime: number; // Position on timeline in seconds (after sequencing)
  duration: number; // Actual duration on timeline (after trimming)
  originalDuration: number; // Original full duration (for timeline ruler)
  trimStart: number; // Trim from original video start
  trimEnd: number; // Trim from original video end (from the end, not absolute)
}

interface TimelineState {
  clips: TimelineClip[];
  playheadPosition: number; // in seconds
  zoom: number; // pixels per second
  duration: number; // total timeline duration
  selectedTimelineClipId: string | null; // Currently selected timeline clip
  
  // Actions
  addClipToTimeline: (mediaClipId: string, clipDuration: number) => void;
  removeClipFromTimeline: (clipId: string) => void;
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
  setPlayheadPosition: (position: number) => void;
  setZoom: (zoom: number) => void;
  selectTimelineClip: (clipId: string | null) => void;
}

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      clips: [],
      playheadPosition: 0,
      zoom: 50, // 50 pixels per second default
      duration: 0,
      selectedTimelineClipId: null,
      
      addClipToTimeline: (mediaClipId, clipDuration) => set((state) => {
        const startTime = state.clips.length > 0
          ? Math.max(...state.clips.map(c => c.startTime + c.originalDuration))
          : 0;

        const newClip: TimelineClip = {
          id: `timeline-clip-${Date.now()}-${Math.random()}`,
          mediaClipId,
          startTime,
          duration: clipDuration,
          originalDuration: clipDuration,
          trimStart: 0,
          trimEnd: 0,
        };

        const newClips = [...state.clips, newClip];
        const newDuration = startTime + clipDuration;

        return {
          clips: newClips,
          duration: newDuration,
        };
      }),
      
      removeClipFromTimeline: (clipId) => set((state) => {
        const filteredClips = state.clips.filter(c => c.id !== clipId);
        
        // Re-sequence clips: each clip starts where the previous one ended
        let currentTime = 0;
        const newClips = filteredClips.map(clip => {
          const newClip = { ...clip, startTime: currentTime };
          currentTime += clip.originalDuration;
          return newClip;
        });

        const newDuration = currentTime;

        return {
          clips: newClips,
          duration: newDuration,
        };
      }),
      
      updateClipTrim: (clipId, trimStart, trimEnd) => set((state) => {
        const clips = state.clips.map(clip => {
          if (clip.id === clipId) {
            const newDuration = clip.originalDuration - trimStart - trimEnd;
            return {
              ...clip,
              trimStart,
              trimEnd,
              duration: Math.max(0.1, newDuration),
            };
          }
          return clip;
        });

        // Log FINAL state
        console.log('[Store] All clips after update:');
        clips.forEach((c, i) => {
          console.log(`  [${i}] duration=${c.duration.toFixed(2)} trimS=${c.trimStart.toFixed(2)} trimE=${c.trimEnd.toFixed(2)} start=${c.startTime.toFixed(2)}`);
        });

        return { clips };
      }),
      
      setPlayheadPosition: (position) => set({ playheadPosition: position }),
      
      setZoom: (zoom) => set({ zoom: Math.max(2, Math.min(200, zoom)) }),
      
      selectTimelineClip: (clipId) => set({ selectedTimelineClipId: clipId }),
    }),
    {
      name: 'clipforge-timeline', // localStorage key
      version: 4, // Increment this to force clear old data
      migrate: (persistedState: any, version: number) => {
        // If version mismatch or undefined, return fresh state
        if (version !== 4) {
          return {
            clips: [],
            playheadPosition: 0,
            zoom: 50,
            duration: 0,
          };
        }
        return persistedState;
      },
    }
  )
);

