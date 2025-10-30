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
  audioOnly?: boolean; // Use only audio from this clip (no video)
  volume?: number; // Volume level 0-200 (100 = normal, default)
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: 'main' | 'overlay';
  height: number; // Track height in pixels
  muted: boolean;
  order: number; // Visual stacking order (0 = bottom/main)
  volume?: number; // Track-level volume 0-200 (100 = normal, default)
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
  soloTrackId: string | null; // ID of solo'd track (mutes all others)
  snapEnabled: boolean; // Whether snap-to-grid/clip is enabled
  snapTolerance: number; // Snap tolerance in seconds (default 0.5s)
  showCentiseconds: boolean; // Whether to show centiseconds in time display
  
  // Actions
  addClipToTimeline: (mediaClipId: string, clipDuration: number, trackId?: string) => void;
  removeClipFromTimeline: (clipId: string) => void;
  updateClipTrim: (clipId: string, trimStart: number, trimEnd: number) => void;
  updateClipAudioOnly: (clipId: string, audioOnly: boolean) => void;
  updateClipVolume: (clipId: string, volume: number) => void;
  updateTrackVolume: (trackId: string, volume: number) => void;
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
  toggleTrackSolo: (trackId: string) => void;
  toggleSnap: () => void;
  toggleShowCentiseconds: () => void;
  getSnapPosition: (position: number, clipId?: string) => number;
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
      soloTrackId: null,
      snapEnabled: true, // Snap enabled by default
      snapTolerance: 0.5, // 0.5 second snap tolerance
      showCentiseconds: true, // Show centiseconds by default
      
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
      
      updateClipAudioOnly: (clipId, audioOnly) => set((state) => ({
        clips: state.clips.map(clip =>
          clip.id === clipId ? { ...clip, audioOnly } : clip
        ),
      })),
      
      updateClipVolume: (clipId, volume) => set((state) => ({
        clips: state.clips.map(clip =>
          clip.id === clipId ? { ...clip, volume } : clip
        ),
      })),
      
      updateTrackVolume: (trackId, volume) => set((state) => ({
        tracks: state.tracks.map(track =>
          track.id === trackId ? { ...track, volume } : track
        ),
      })),
      
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
        
        // Calculate the PLAYABLE region of the clip (accounting for existing trims)
        const playableStart = clip.startTime + clip.trimStart;
        const playableEnd = clip.startTime + clip.originalDuration - clip.trimEnd;
        
        // Check if playhead is within the PLAYABLE region
        if (playheadPosition <= playableStart || playheadPosition >= playableEnd) {
          console.warn('⚠️ Playhead not within clip playable bounds', {
            playheadPosition,
            playableStart,
            playableEnd,
            trimStart: clip.trimStart,
            trimEnd: clip.trimEnd
          });
          return state;
        }
        
        // Split point offset from clip start (in video time, from 0 to originalDuration)
        const splitOffset = playheadPosition - clip.startTime;
        
        console.log('🔪 Splitting clip (Loom model):', {
          clipId,
          clipStart: clip.startTime,
          playableStart,
          playableEnd,
          playheadPosition,
          splitOffset,
          originalDuration: clip.originalDuration,
          existingTrims: { trimStart: clip.trimStart, trimEnd: clip.trimEnd }
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
        
        // Validate that both clips have positive durations
        if (clip1.duration <= 0 || clip2.duration <= 0) {
          console.error('❌ Split would create invalid clip durations:', {
            clip1Duration: clip1.duration,
            clip2Duration: clip2.duration,
            splitOffset,
            existingTrims: { trimStart: clip.trimStart, trimEnd: clip.trimEnd }
          });
          return state; // Abort split
        }
        
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
      
      toggleTrackSolo: (trackId) => set((state) => {
        // If clicking the already solo'd track, un-solo it
        if (state.soloTrackId === trackId) {
          console.log('🔊 Un-soloing track:', trackId);
          return { soloTrackId: null };
        }
        
        // Otherwise, solo this track (mutes all others)
        console.log('🎵 Soloing track:', trackId);
        return { soloTrackId: trackId };
      }),
      
      toggleSnap: () => set((state) => {
        const newSnap = !state.snapEnabled;
        console.log(newSnap ? '🧲 Snap enabled' : '🔓 Snap disabled');
        return { snapEnabled: newSnap };
      }),
      
      toggleShowCentiseconds: () => set((state) => {
        const newValue = !state.showCentiseconds;
        console.log(newValue ? '🕐 Centiseconds: SHOW' : '🕐 Centiseconds: HIDE');
        return { showCentiseconds: newValue };
      }),
      
      getSnapPosition: (position, clipId) => {
        const state = get();
        
        console.log('🔍 getSnapPosition called:', {
          position: position.toFixed(3),
          clipId,
          snapEnabled: state.snapEnabled
        });
        
        if (!state.snapEnabled) {
          console.log('❌ Snap is DISABLED, returning original position');
          return position;
        }
        
        const { clips, snapTolerance, playheadPosition, duration } = state;
        
        // Collect all snap points
        const snapPoints: number[] = [];
        
        // 1. Add GRID snap points (every 1 second)
        const gridInterval = 1.0; // 1 second grid
        const maxTime = Math.max(duration, 60); // At least 60 seconds
        for (let t = 0; t <= maxTime; t += gridInterval) {
          snapPoints.push(t);
        }
        console.log(`📐 Added ${Math.floor(maxTime / gridInterval) + 1} grid points (every ${gridInterval}s)`);
        
        // 2. Add playhead position
        snapPoints.push(playheadPosition);
        
        // 3. Add all clip edges (excluding the clip being edited)
        clips.forEach(clip => {
          if (clip.id !== clipId) {
            snapPoints.push(clip.startTime); // Clip start
            snapPoints.push(clip.startTime + clip.trimStart); // Playable start
            snapPoints.push(clip.startTime + clip.originalDuration - clip.trimEnd); // Playable end
            snapPoints.push(clip.startTime + clip.originalDuration); // Clip end
          }
        });
        
        console.log('📍 Total snap points:', snapPoints.length);
        console.log('📏 Snap tolerance:', snapTolerance);
        
        // Find closest snap point
        let closestPoint = position;
        let minDistance = snapTolerance;
        let snappedToPoint = null;
        let snapType = '';
        
        snapPoints.forEach(point => {
          const distance = Math.abs(position - point);
          if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
            snappedToPoint = point;
            
            // Determine snap type for logging
            if (point % 1.0 === 0) {
              snapType = 'grid';
            } else if (point === playheadPosition) {
              snapType = 'playhead';
            } else {
              snapType = 'clip';
            }
          }
        });
        
        if (snappedToPoint !== null) {
          console.log(`✅ SNAPPED to ${snapType.toUpperCase()} from`, position.toFixed(3), 'to', closestPoint.toFixed(3), '(distance:', minDistance.toFixed(3), 's)');
        } else {
          console.log('⚪ NO SNAP (no point within tolerance)');
        }
        
        return closestPoint;
      },
      
      setSelectionInPoint: (position) => set({ selectionInPoint: position }),
      
      setSelectionOutPoint: (position) => set({ selectionOutPoint: position }),
      
      clearSelection: () => set({ selectionInPoint: null, selectionOutPoint: null }),
      
      deleteSelectedRegion: () => set((state) => {
        const { selectionInPoint, selectionOutPoint, selectedTimelineClipId } = state;
        
        // Need both points to delete
        if (selectionInPoint === null || selectionOutPoint === null) {
          console.warn('⚠️ No selection to delete');
          return state;
        }
        
        // Find which track we're deleting from (from the selected clip)
        const selectedClip = state.clips.find(c => c.id === selectedTimelineClipId);
        const targetTrackId = selectedClip?.trackId || state.tracks[0]?.id; // Default to main track if no selection
        
        const start = Math.min(selectionInPoint, selectionOutPoint);
        const end = Math.max(selectionInPoint, selectionOutPoint);
        
        console.log(`🗑️ Deleting selected region: ${start.toFixed(2)}s - ${end.toFixed(2)}s on track ${targetTrackId}`);
        
        // Find clips that overlap with the selected region ON THE SELECTED TRACK ONLY
        // Must check PLAYABLE bounds (accounting for trims), not full clip bounds
        const affectedClips = state.clips.filter(clip => {
          if (clip.trackId !== targetTrackId) return false; // Skip clips on other tracks
          
          // Use PLAYABLE region (accounting for existing trims)
          const playableStart = clip.startTime + clip.trimStart;
          const playableEnd = clip.startTime + clip.originalDuration - clip.trimEnd;
          
          // Check if selection overlaps with PLAYABLE region
          return playableStart < end && playableEnd > start;
        });
        
        if (affectedClips.length === 0) {
          console.warn('⚠️ No clips in selected region');
          return { ...state, selectionInPoint: null, selectionOutPoint: null };
        }
        
        // Process each affected clip
        const newClips: TimelineClip[] = [];
        const otherClips = state.clips.filter(c => !affectedClips.includes(c));
        
        affectedClips.forEach(clip => {
          // Work with PLAYABLE region (accounting for existing trims)
          const playableStart = clip.startTime + clip.trimStart;
          const playableEnd = clip.startTime + clip.originalDuration - clip.trimEnd;
          
          console.log('Processing clip:', {
            clipId: clip.id,
            playableStart,
            playableEnd,
            selectionStart: start,
            selectionEnd: end,
            existingTrims: { trimStart: clip.trimStart, trimEnd: clip.trimEnd }
          });
          
          // Case 1: Selection completely covers the PLAYABLE region - delete entire clip
          if (start <= playableStart && end >= playableEnd) {
            console.log('→ Case 1: Clip completely deleted');
            // Clip is completely deleted, don't add to newClips
            return;
          }
          
          // Case 2: Selection is in the middle of PLAYABLE region - split into two parts
          if (start > playableStart && end < playableEnd) {
            console.log('→ Case 2: Split in middle');
            
            // Calculate trim values in VIDEO time (0 to originalDuration)
            const splitStartInVideo = start - clip.startTime; // Where selection starts in video
            const splitEndInVideo = end - clip.startTime;     // Where selection ends in video
            
            const newTrimEndBefore = clip.originalDuration - splitStartInVideo;
            const newTrimStartAfter = splitEndInVideo;
            
            const durationBefore = clip.originalDuration - clip.trimStart - newTrimEndBefore;
            const durationAfter = clip.originalDuration - newTrimStartAfter - clip.trimEnd;
            
            console.log('Split calculations:', {
              splitStartInVideo,
              splitEndInVideo,
              newTrimEndBefore,
              newTrimStartAfter,
              durationBefore,
              durationAfter
            });
            
            // Validate durations
            if (durationBefore > 0) {
              newClips.push({
                ...clip,
                id: `timeline-clip-${Date.now()}-${Math.random()}-before`,
                trimEnd: newTrimEndBefore,
                duration: durationBefore,
              });
            }
            
            if (durationAfter > 0) {
              newClips.push({
                ...clip,
                id: `timeline-clip-${Date.now()}-${Math.random()}-after`,
                trimStart: newTrimStartAfter,
                duration: durationAfter,
              });
            }
          }
          
          // Case 3: Selection cuts off the start of PLAYABLE region
          else if (start <= playableStart && end > playableStart && end < playableEnd) {
            console.log('→ Case 3: Cut from start');
            
            const cutEndInVideo = end - clip.startTime;
            const newTrimStart = cutEndInVideo;
            const newDuration = clip.originalDuration - newTrimStart - clip.trimEnd;
            
            if (newDuration > 0) {
              newClips.push({
                ...clip,
                trimStart: newTrimStart,
                duration: newDuration,
              });
            }
          }
          
          // Case 4: Selection cuts off the end of PLAYABLE region
          else if (start > playableStart && start < playableEnd && end >= playableEnd) {
            console.log('→ Case 4: Cut from end');
            
            const cutStartInVideo = start - clip.startTime;
            const newTrimEnd = clip.originalDuration - cutStartInVideo;
            const newDuration = clip.originalDuration - clip.trimStart - newTrimEnd;
            
            if (newDuration > 0) {
              newClips.push({
                ...clip,
                trimEnd: newTrimEnd,
                duration: newDuration,
              });
            }
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

