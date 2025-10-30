import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface TimelineClip {
  id: string;
  mediaClipId: string; // Reference to imported media
  trackId: string; // Which track this clip belongs to
  startTime: number; // Position on timeline in seconds (after sequencing)
  duration: number; // Actual duration on timeline (after trimming)
  originalDuration: number; // Original full duration (for timeline ruler)
  trimStart: number; // Trim from original video start
  trimEnd: number; // Trim from original video end (from the end, not absolute)
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'main' | 'overlay';
  height: number; // Track height in pixels
  muted: boolean;
  order: number; // Visual stacking order (0 = bottom/main)
}

interface TimelineState {
  clips: TimelineClip[];
  tracks: TimelineTrack[];
  playheadPosition: number; // in seconds
  zoom: number; // pixels per second
  duration: number; // total timeline duration
  selectedTimelineClipId: string | null; // Currently selected timeline clip
  
  // Actions
  addClipToTimeline: (mediaClipId: string, clipDuration: number, trackId?: string) => void;
  removeClipFromTimeline: (clipId: string) => void;
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
  reorderClip: (clipId: string, newIndex: number, newTrackId?: string) => void;
  splitClipAtPlayhead: (clipId: string) => void;
  setPlayheadPosition: (position: number) => void;
  setZoom: (zoom: number) => void;
  selectTimelineClip: (clipId: string | null) => void;
  addTrack: (type: 'main' | 'overlay') => void;
  removeTrack: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;
}

let allowPersistence = true;

const timelineStorage = createJSONStorage(() => ({
  getItem: (name: string) => localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (allowPersistence) {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
}));

export const useTimelineStore = create<TimelineState>()(
  persist(
    (set, get) => ({
      clips: [],
      tracks: [
        { id: 'track-main', name: 'Main Video', type: 'main', height: 90, muted: false, order: 0 }
      ],
      playheadPosition: 0,
      zoom: 50, // 50 pixels per second default
      duration: 0,
      selectedTimelineClipId: null,
      
      addClipToTimeline: (mediaClipId, clipDuration, trackId) => set((state) => {
        const targetTrackId = trackId || state.tracks[0].id;
        const trackClips = state.clips.filter(c => c.trackId === targetTrackId);
        
        // Position based on ORIGINAL duration (Loom model)
        const startTime = trackClips.length > 0
          ? Math.max(...trackClips.map(c => c.startTime + c.originalDuration))
          : 0;

        const newClip: TimelineClip = {
          id: `timeline-clip-${Date.now()}-${Math.random()}`,
          mediaClipId,
          trackId: targetTrackId,
          startTime,
          duration: clipDuration, // Playable duration (for export)
          originalDuration: clipDuration,
          trimStart: 0,
          trimEnd: 0,
        };

        const newClips = [...state.clips, newClip];
        // Total duration = sum of ORIGINAL durations
        const newDuration = Math.max(
          ...newClips.map(c => c.startTime + c.originalDuration)
        );

        return {
          clips: newClips,
          duration: newDuration,
        };
      }),
      
      removeClipFromTimeline: (clipId) => set((state) => {
        const removedClip = state.clips.find(c => c.id === clipId);
        if (!removedClip) return state;
        
        const filteredClips = state.clips.filter(c => c.id !== clipId);
        
        // Re-sequence clips within the same track using ORIGINAL duration
        const trackClips = filteredClips.filter(c => c.trackId === removedClip.trackId);
        const otherClips = filteredClips.filter(c => c.trackId !== removedClip.trackId);
        
        let currentTime = 0;
        const resequencedTrackClips = trackClips.map(clip => {
          const newClip = { ...clip, startTime: currentTime };
          currentTime += clip.originalDuration; // Use ORIGINAL duration
          return newClip;
        });
        
        const newClips = [...resequencedTrackClips, ...otherClips];
        const newDuration = newClips.length > 0
          ? Math.max(...newClips.map(c => c.startTime + c.originalDuration))
          : 0;

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
              duration: Math.max(0.1, newDuration), // Playable duration
              // startTime unchanged - positions based on originalDuration
            };
          }
          return clip;
        });

        // No position recalculation needed - clips stay in place
        return { clips };
      }),
      
      reorderClip: (clipId, newIndex, newTrackId) => set((state) => {
        const clip = state.clips.find(c => c.id === clipId);
        if (!clip) return state;
        
        const targetTrackId = newTrackId || clip.trackId;
        const trackClips = state.clips.filter(c => 
          c.trackId === targetTrackId && c.id !== clipId
        );
        
        // Insert clip at new index
        trackClips.splice(newIndex, 0, { ...clip, trackId: targetTrackId });
        
        // Re-sequence this track using ORIGINAL duration
        let currentTime = 0;
        const resequencedTrackClips = trackClips.map(c => {
          const newClip = { ...c, startTime: currentTime };
          currentTime += c.originalDuration;
          return newClip;
        });
        
        // Combine with other tracks
        const otherTrackClips = state.clips.filter(c => c.trackId !== targetTrackId);
        const newClips = [...resequencedTrackClips, ...otherTrackClips];
        
        const newDuration = Math.max(...newClips.map(c => c.startTime + c.originalDuration));
        
        return { clips: newClips, duration: newDuration };
      }),
      
      splitClipAtPlayhead: (clipId) => set((state) => {
        const clip = state.clips.find(c => c.id === clipId);
        if (!clip) return state;
        
        const { playheadPosition } = state;
        const clipStart = clip.startTime;
        const clipEnd = clip.startTime + clip.originalDuration;
        
        // Check if playhead is within this clip (in timeline space)
        if (playheadPosition <= clipStart || playheadPosition >= clipEnd) {
          return state;
        }
        
        // Split point in timeline space
        const splitOffset = playheadPosition - clipStart;
        
        // Create two new clips - each gets half of the original duration
        const clip1: TimelineClip = {
          id: `timeline-clip-${Date.now()}-${Math.random()}-a`,
          mediaClipId: clip.mediaClipId,
          trackId: clip.trackId,
          startTime: clip.startTime,
          trimStart: clip.trimStart,
          trimEnd: clip.trimEnd + (clip.originalDuration - splitOffset), // Trim end of first part
          duration: Math.max(0.1, splitOffset - clip.trimStart),
          originalDuration: splitOffset, // First clip's original is up to split
        };
        
        const clip2: TimelineClip = {
          id: `timeline-clip-${Date.now()}-${Math.random()}-b`,
          mediaClipId: clip.mediaClipId,
          trackId: clip.trackId,
          startTime: playheadPosition,
          trimStart: splitOffset, // Second clip starts at split point in video
          trimEnd: clip.trimEnd,
          duration: Math.max(0.1, (clip.originalDuration - splitOffset) - clip.trimEnd),
          originalDuration: clip.originalDuration - splitOffset,
        };
        
        // Replace original clip with two new clips
        const newClips = state.clips.map(c => 
          c.id === clipId ? null : c
        ).filter(Boolean) as TimelineClip[];
        
        newClips.push(clip1, clip2);
        
        // Re-sequence the track using ORIGINAL duration
        const trackClips = newClips
          .filter(c => c.trackId === clip.trackId)
          .sort((a, b) => a.startTime - b.startTime);
        
        let currentTime = 0;
        const resequencedTrackClips = trackClips.map(c => {
          const newClip = { ...c, startTime: currentTime };
          currentTime += c.originalDuration;
          return newClip;
        });
        
        const otherTrackClips = newClips.filter(c => c.trackId !== clip.trackId);
        const finalClips = [...resequencedTrackClips, ...otherTrackClips];
        
        return { 
          clips: finalClips, 
          selectedTimelineClipId: clip2.id // Select the second clip after split
        };
      }),
      
      setPlayheadPosition: (position) => {
        allowPersistence = false;
        try {
          set({ playheadPosition: position });
        } finally {
          allowPersistence = true;
        }
      },
      
      setZoom: (zoom) => set({ zoom: Math.max(2, Math.min(200, zoom)) }),
      
      selectTimelineClip: (clipId) => set({ selectedTimelineClipId: clipId }),
      
      addTrack: (type) => set((state) => {
        // If no tracks exist, create the first main track
        if (state.tracks.length === 0) {
          const mainTrack: TimelineTrack = {
            id: 'track-main',
            name: 'Main Video',
            type: 'main',
            height: 90,
            muted: false,
            order: 0,
          };
          return { tracks: [mainTrack] };
        }
        
        const newOrder = Math.max(...state.tracks.map(t => t.order)) + 1;
        const newTrack: TimelineTrack = {
          id: `track-${Date.now()}`,
          name: type === 'main' ? `Video ${newOrder + 1}` : `Overlay ${newOrder + 1}`,
          type,
          height: 90,
          muted: false,
          order: newOrder,
        };
        return { tracks: [...state.tracks, newTrack] };
      }),
      
      removeTrack: (trackId) => set((state) => {
        // Don't allow removing the last track
        if (state.tracks.length <= 1) return state;
        
        // Remove clips from this track
        const newClips = state.clips.filter(c => c.trackId !== trackId);
        const newTracks = state.tracks.filter(t => t.id !== trackId);
        
        return { clips: newClips, tracks: newTracks };
      }),
      
      toggleTrackMute: (trackId) => set((state) => {
        const newTracks = state.tracks.map(t =>
          t.id === trackId ? { ...t, muted: !t.muted } : t
        );
        return { tracks: newTracks };
      }),
    }),
    {
      name: 'clipforge-timeline', // localStorage key
      version: 5, // Increment this to force clear old data
      storage: timelineStorage,
      migrate: (persistedState: any, version: number) => {
        // If version mismatch or undefined, return fresh state
        if (version !== 5) {
          return {
            clips: [],
            tracks: [
              { id: 'track-main', name: 'Main Video', type: 'main', height: 90, muted: false, order: 0 }
            ],
            playheadPosition: 0,
            zoom: 50,
            duration: 0,
            selectedTimelineClipId: null,
          };
        }
        return persistedState;
      },
    }
  )
);

