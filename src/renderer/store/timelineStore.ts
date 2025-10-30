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
  selectionInPoint: number | null; // In point for selection (seconds)
  selectionOutPoint: number | null; // Out point for selection (seconds)
  
  // Actions
  addClipToTimeline: (mediaClipId: string, clipDuration: number, trackId?: string) => void;
  removeClipFromTimeline: (clipId: string) => void;
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
  reorderClip: (clipId: string, newIndex: number, newTrackId?: string) => void;
  splitClipAtPlayhead: (clipId: string) => void;
  duplicateClip: (clipId: string) => void;
  deleteTrimmedRegion: (clipId: string) => void;
  setSelectionInPoint: (position: number | null) => void;
  setSelectionOutPoint: (position: number | null) => void;
  deleteSelectedRegion: () => void;
  clearSelection: () => void;
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
      selectionInPoint: null,
      selectionOutPoint: null,
      
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
        
        // Check if removed clip had "siblings" at same position (split clips)
        const siblingsAtSamePosition = filteredClips.filter(c => 
          c.trackId === removedClip.trackId && 
          c.startTime === removedClip.startTime &&
          c.originalDuration === removedClip.originalDuration
        );
        
        // If siblings exist at same position, DON'T re-sequence (they're split clips)
        // Just remove the clip and keep others in place
        if (siblingsAtSamePosition.length > 0) {
          const newDuration = filteredClips.length > 0
            ? Math.max(...filteredClips.map(c => c.startTime + c.originalDuration))
            : 0;
          
          console.log('✅ Removed split clip, keeping siblings at same position');
          
          return {
            clips: filteredClips,
            duration: newDuration,
            selectedTimelineClipId: null,
          };
        }
        
        // Normal case: Re-sequence clips within the same track
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
          selectedTimelineClipId: null,
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
          console.warn('⚠️ Playhead not within clip bounds');
          return state;
        }
        
        // Split point offset from clip start (in video time)
        const splitOffset = playheadPosition - clipStart;
        
        console.log('🔪 Splitting clip (Loom model):', {
          clipId,
          clipStart,
          splitOffset,
          originalDuration: clip.originalDuration,
        });
        
        // ✅ LOOM MODEL: Both clips at SAME position, SAME originalDuration
        // Use trimStart/trimEnd to control which half is visible
        
        const clip1: TimelineClip = {
          id: `timeline-clip-${Date.now()}-${Math.random()}-a`,
          mediaClipId: clip.mediaClipId,
          trackId: clip.trackId,
          startTime: clip.startTime, // SAME position
          originalDuration: clip.originalDuration, // SAME duration
          trimStart: clip.trimStart, // Keep existing start trim
          trimEnd: clip.originalDuration - splitOffset, // Trim everything after split point
          duration: Math.max(0.1, splitOffset - clip.trimStart),
        };
        
        const clip2: TimelineClip = {
          id: `timeline-clip-${Date.now()}-${Math.random()}-b`,
          mediaClipId: clip.mediaClipId,
          trackId: clip.trackId,
          startTime: clip.startTime, // SAME position
          originalDuration: clip.originalDuration, // SAME duration
          trimStart: splitOffset, // Trim everything before split point
          trimEnd: clip.trimEnd, // Keep existing end trim
          duration: Math.max(0.1, (clip.originalDuration - splitOffset) - clip.trimEnd),
        };
        
        console.log('✅ Created split clips:', {
          clip1: { trimStart: clip1.trimStart, trimEnd: clip1.trimEnd, duration: clip1.duration },
          clip2: { trimStart: clip2.trimStart, trimEnd: clip2.trimEnd, duration: clip2.duration },
        });
        
        // Replace original clip with two new clips
        const newClips = state.clips.map(c => 
          c.id === clipId ? null : c
        ).filter(Boolean) as TimelineClip[];
        
        newClips.push(clip1, clip2);
        
        // NO re-sequencing needed! Clips stay at same position
        // Timeline length unchanged
        
        return { 
          clips: newClips, 
          selectedTimelineClipId: clip2.id // Select the second clip after split
        };
      }),
      
      duplicateClip: (clipId) => set((state) => {
        const clip = state.clips.find(c => c.id === clipId);
        if (!clip) return state;
        
        // Place duplicate at end of track
        const trackClips = state.clips.filter(c => c.trackId === clip.trackId);
        const startTime = trackClips.length > 0
          ? Math.max(...trackClips.map(c => c.startTime + c.originalDuration))
          : 0;
        
        const duplicatedClip: TimelineClip = {
          ...clip,
          id: `timeline-clip-${Date.now()}-${Math.random()}`,
          startTime,
        };
        
        const newClips = [...state.clips, duplicatedClip];
        const newDuration = Math.max(...newClips.map(c => c.startTime + c.originalDuration));
        
        console.log('✅ Duplicated clip to end of track at:', startTime);
        
        return { 
          clips: newClips,
          duration: newDuration,
          selectedTimelineClipId: duplicatedClip.id, // Select the duplicate
        };
      }),
      
      deleteTrimmedRegion: (clipId) => set((state) => {
        const clip = state.clips.find(c => c.id === clipId);
        if (!clip) return state;
        
        // Check if clip has any trimming
        if (clip.trimStart === 0 && clip.trimEnd === 0) {
          console.warn('⚠️ No trimmed region to delete');
          return state;
        }
        
        console.log('🗑️ Deleting trimmed region, keeping untrimmed segments');
        
        const clips: TimelineClip[] = [];
        
        // Keep the start segment if there's a trimStart
        if (clip.trimStart > 0) {
          clips.push({
            id: `timeline-clip-${Date.now()}-${Math.random()}-start`,
            mediaClipId: clip.mediaClipId,
            trackId: clip.trackId,
            startTime: clip.startTime,
            originalDuration: clip.trimStart, // Only the untrimmed start portion
            trimStart: 0,
            trimEnd: 0,
            duration: clip.trimStart,
          });
        }
        
        // Keep the end segment if there's a trimEnd
        if (clip.trimEnd > 0) {
          const endStartTime = clip.trimStart > 0 
            ? clip.startTime + clip.trimStart 
            : clip.startTime;
          
          clips.push({
            id: `timeline-clip-${Date.now()}-${Math.random()}-end`,
            mediaClipId: clip.mediaClipId,
            trackId: clip.trackId,
            startTime: endStartTime,
            originalDuration: clip.trimEnd, // Only the untrimmed end portion
            trimStart: 0,
            trimEnd: 0,
            duration: clip.trimEnd,
          });
        }
        
        // Remove original clip and add new segments
        const otherClips = state.clips.filter(c => c.id !== clipId);
        const newClips = [...otherClips, ...clips];
        
        // Re-sequence the affected track
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
        
        const newDuration = finalClips.length > 0
          ? Math.max(...finalClips.map(c => c.startTime + c.originalDuration))
          : 0;
        
        console.log('✅ Deleted trimmed region, kept', clips.length, 'segments');
        
        return { 
          clips: finalClips,
          duration: newDuration,
          selectedTimelineClipId: null, // Deselect since original clip is gone
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
      
      setSelectionInPoint: (position) => set({ selectionInPoint: position }),
      
      setSelectionOutPoint: (position) => set({ selectionOutPoint: position }),
      
      clearSelection: () => set({ selectionInPoint: null, selectionOutPoint: null }),
      
      deleteSelectedRegion: () => set((state) => {
        const { selectionInPoint, selectionOutPoint } = state;
        
        // Need both points to delete
        if (selectionInPoint === null || selectionOutPoint === null) {
          console.warn('⚠️ No selection to delete');
          return state;
        }
        
        const start = Math.min(selectionInPoint, selectionOutPoint);
        const end = Math.max(selectionInPoint, selectionOutPoint);
        
        console.log(`🗑️ Deleting selected region: ${start.toFixed(2)}s - ${end.toFixed(2)}s`);
        
        // Find all clips that overlap with the selected region
        const affectedClips = state.clips.filter(clip => {
          const clipStart = clip.startTime;
          const clipEnd = clip.startTime + clip.originalDuration;
          return clipStart < end && clipEnd > start;
        });
        
        if (affectedClips.length === 0) {
          console.warn('⚠️ No clips in selected region');
          return { ...state, selectionInPoint: null, selectionOutPoint: null };
        }
        
        // Process each affected clip
        const newClips: TimelineClip[] = [];
        const otherClips = state.clips.filter(c => !affectedClips.includes(c));
        
        affectedClips.forEach(clip => {
          const clipStart = clip.startTime;
          const clipEnd = clip.startTime + clip.originalDuration;
          
          // Case 1: Selection completely covers clip - delete entire clip
          if (start <= clipStart && end >= clipEnd) {
            // Clip is completely deleted, don't add to newClips
            return;
          }
          
          // Case 2: Selection is in the middle of clip - split into two parts
          // LOOM MODEL: Both parts maintain original startTime and full originalDuration,
          // but use trim to show only their respective portions
          if (start > clipStart && end < clipEnd) {
            const offsetFromStart = start - clipStart;
            const deletedDuration = end - start;
            
            const newTrimEndBefore = clip.trimEnd + (clipEnd - start);
            const newTrimStartAfter = clip.trimStart + offsetFromStart + deletedDuration;
            
            // Keep the part before selection
            newClips.push({
              ...clip,
              id: `timeline-clip-${Date.now()}-${Math.random()}-before`,
              trimEnd: newTrimEndBefore,
              duration: clip.originalDuration - clip.trimStart - newTrimEndBefore,
            });
            
            // Keep the part after selection
            newClips.push({
              ...clip,
              id: `timeline-clip-${Date.now()}-${Math.random()}-after`,
              trimStart: newTrimStartAfter,
              duration: clip.originalDuration - newTrimStartAfter - clip.trimEnd,
            });
          }
          
          // Case 3: Selection cuts off the start of clip
          else if (start <= clipStart && end > clipStart && end < clipEnd) {
            const cutAmount = end - clipStart;
            const newTrimStart = clip.trimStart + cutAmount;
            newClips.push({
              ...clip,
              trimStart: newTrimStart,
              duration: clip.originalDuration - newTrimStart - clip.trimEnd,
            });
          }
          
          // Case 4: Selection cuts off the end of clip
          else if (start > clipStart && start < clipEnd && end >= clipEnd) {
            const cutAmount = clipEnd - start;
            const newTrimEnd = clip.trimEnd + cutAmount;
            newClips.push({
              ...clip,
              trimEnd: newTrimEnd,
              duration: clip.originalDuration - clip.trimStart - newTrimEnd,
            });
          }
        });
        
        // Combine all clips (NO re-sequencing - maintain positions!)
        const allClips = [...otherClips, ...newClips];
        
        const newDuration = allClips.length > 0
          ? Math.max(...allClips.map(c => c.startTime + c.originalDuration))
          : 0;
        
        return {
          clips: allClips,
          duration: newDuration,
          selectionInPoint: null,
          selectionOutPoint: null,
          selectedTimelineClipId: null,
        };
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

