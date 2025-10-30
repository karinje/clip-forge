import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../../store/timelineStore';
import { useProjectStore } from '../../store/projectStore';
import { TimelineClip } from './TimelineClip';
import styles from './Timeline.module.css';

interface Props {
  onExportClick: () => void;
  playPauseHandler?: React.MutableRefObject<(() => void) | null>;
}

export const Timeline: React.FC<Props> = ({ onExportClick, playPauseHandler }) => {
  const { 
    clips, 
    tracks, 
    playheadPosition, 
    zoom,
    setPlayheadPosition,
    setZoom,
    updateClipTrim, 
    addClipToTimeline, 
    removeClipFromTimeline, 
    selectTimelineClip, 
    splitClipAtPlayhead,
    duplicateClip,
    deleteTrimmedRegion,
    addTrack,
    removeTrack,
    toggleTrackMute,
    selectedTimelineClipId: storeSelectedClipId,
    selectionInPoint,
    selectionOutPoint,
    setSelectionInPoint,
    setSelectionOutPoint,
    deleteSelectedRegion,
    clearSelection
  } = useTimelineStore();
  const selectedClipId = useProjectStore(state => state.selectedClipId);
  const selectClip = useProjectStore(state => state.selectClip);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Ensure we always have at least one track
  useEffect(() => {
    if (tracks.length === 0) {
      console.log('⚠️ No tracks found, initializing default track...');
      addTrack('main');
    }
  }, [tracks.length, addTrack]);
  
  const maxDuration = clips.length > 0
    ? Math.max(...clips.map(c => c.startTime + c.originalDuration))
    : 60;
  
  // Use zoom from store for interactive zoom controls
  const totalWidth = Math.max(maxDuration * zoom, scrollContainerRef.current?.clientWidth || 800);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Generate ~5 evenly spaced tick marks
  const generateTicks = () => {
    const targetTickCount = 5;
    if (maxDuration === 0) return [0];
    
    // Find nice round interval
    const rawInterval = maxDuration / targetTickCount;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
    const normalized = rawInterval / magnitude;
    
    let niceInterval;
    if (normalized < 1.5) niceInterval = magnitude;
    else if (normalized < 3) niceInterval = 2 * magnitude;
    else if (normalized < 7) niceInterval = 5 * magnitude;
    else niceInterval = 10 * magnitude;
    
    const ticks = [];
    for (let i = 0; i <= maxDuration; i += niceInterval) {
      ticks.push(i);
    }
    return ticks;
  };
  
  const ticks = generateTicks();
  
  const handleClipSelect = (timelineClipId: string, mediaClipId: string) => {
    selectTimelineClip(timelineClipId); // Update timeline store selection
    if (selectedClipId) {
      selectClip(''); // Clear media library selection
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space bar for play/pause (don't require clip selection)
      if (e.code === 'Space') {
        // Don't trigger if user is typing in an input field
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        if (playPauseHandler?.current) {
          playPauseHandler.current();
        }
        return;
      }
      
      // I key: Set In point at playhead
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        console.log('📍 Setting IN point at:', playheadPosition);
        setSelectionInPoint(playheadPosition);
        return;
      }
      
      // O key: Set Out point at playhead
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        console.log('📍 Setting OUT point at:', playheadPosition);
        setSelectionOutPoint(playheadPosition);
        return;
      }
      
      // Escape key: Clear selection (IN/OUT points)
      if (e.key === 'Escape') {
        if (selectionInPoint !== null || selectionOutPoint !== null) {
          e.preventDefault();
          console.log('❌ Clearing selection');
          clearSelection();
        }
        return;
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        
        // If there's a selection (in/out points), delete that region
        if (selectionInPoint !== null && selectionOutPoint !== null) {
          console.log('🗑️ Deleting selected region');
          deleteSelectedRegion();
        } 
        // Otherwise, if there's a selected clip, delete it
        else if (storeSelectedClipId) {
          if (e.shiftKey) {
            // Shift+Delete: Delete trimmed region, keep untrimmed segments
            console.log('🗑️ Shift+Delete: Deleting trimmed region');
            deleteTrimmedRegion(storeSelectedClipId);
          } else {
            // Regular Delete: Remove entire clip
            console.log('🗑️ Delete: Removing clip');
            removeClipFromTimeline(storeSelectedClipId);
          }
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k' && storeSelectedClipId) {
        // Split clip at playhead (Cmd/Ctrl+K)
        e.preventDefault();
        console.log('🔪 Splitting clip at playhead:', playheadPosition);
        splitClipAtPlayhead(storeSelectedClipId);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'd' && storeSelectedClipId) {
        // Duplicate clip (Cmd/Ctrl+D)
        e.preventDefault();
        console.log('📋 Duplicating clip');
        duplicateClip(storeSelectedClipId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [storeSelectedClipId, playheadPosition, selectionInPoint, selectionOutPoint, removeClipFromTimeline, splitClipAtPlayhead, duplicateClip, deleteTrimmedRegion, setSelectionInPoint, setSelectionOutPoint, deleteSelectedRegion, clearSelection, playPauseHandler]);
  
  const handleDrop = (e: React.DragEvent, trackId?: string) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData('application/clipforge-clip');
    if (data) {
      try {
        const { id, duration } = JSON.parse(data);
        // If trackId is provided, use it; otherwise use first track
        const targetTrackId = trackId || tracks[0]?.id;
        addClipToTimeline(id, duration, targetTrackId);
      } catch (err) {
        // Failed to parse dropped clip data
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  
  const handleTimelineClick = (e: React.MouseEvent) => {
    // Only handle clicks on the timeline background or tracks, not on clips
    const target = e.target as HTMLElement;
    const isTimelineBackground = target.classList.contains(styles.timelineContent) || 
                                   target.classList.contains(styles.track) ||
                                   target.classList.contains(styles.emptyTrack);
    
    if (!isTimelineBackground) return;
    
    // Get click position relative to timeline
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left + (scrollContainerRef.current?.scrollLeft || 0);
    const clickTime = clickX / zoom;
    
    console.log('🎯 Playhead clicked at:', clickTime.toFixed(2), 's');
    
    // Update playhead position (this will trigger video seek via PreviewPlayer effect)
    setPlayheadPosition(clickTime);
    
    // Find which clip contains this time position (if any) and select it
    const clickedClip = clips.find(c => 
      clickTime >= c.startTime && clickTime <= (c.startTime + c.duration)
    );
    
    if (clickedClip) {
      // Auto-select the clip that was clicked
      selectTimelineClip(clickedClip.id);
      console.log('📌 Auto-selected clip:', clickedClip.id);
    }
  };
  
  const handleAddOverlayTrack = () => {
    addTrack('overlay');
  };
  
  const handleReset = () => {
    if (confirm('Clear all data? This will remove all imported videos and timeline clips. This action cannot be undone.')) {
      // Clear localStorage
      localStorage.clear();
      
      // Force reload to reinitialize everything
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };
  
  const handleZoomIn = () => {
    setZoom(zoom * 1.3); // 30% more zoom
  };
  
  const handleZoomOut = () => {
    setZoom(zoom / 1.3); // 30% less zoom
  };
  
  const handleZoomToFit = () => {
    const containerWidth = scrollContainerRef.current?.clientWidth || 800;
    const fitZoom = maxDuration > 0 ? (containerWidth - 100) / maxDuration : 10;
    setZoom(fitZoom);
  };
  
  const handleSplit = () => {
    if (storeSelectedClipId) {
      splitClipAtPlayhead(storeSelectedClipId);
    }
  };
  
  const handleDelete = () => {
    if (storeSelectedClipId) {
      removeClipFromTimeline(storeSelectedClipId);
    }
  };
  
  const handleDuplicate = () => {
    if (storeSelectedClipId) {
      duplicateClip(storeSelectedClipId);
    }
  };
  
  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <div className={styles.title}>Timeline</div>
        <div className={styles.controls}>
          {/* Loom-style editing controls */}
          <div className={styles.editingControls}>
            <button
              className={styles.toolButton}
              onClick={handleSplit}
              disabled={!storeSelectedClipId}
              title="Split clip at playhead (Cmd+K)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              <span>Split</span>
            </button>
            <button
              className={styles.toolButton}
              onClick={handleDelete}
              disabled={!storeSelectedClipId}
              title="Delete selected clip (Delete)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Delete</span>
            </button>
            <button
              className={styles.toolButton}
              onClick={handleDuplicate}
              disabled={!storeSelectedClipId}
              title="Duplicate selected clip (Cmd+D)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              <span>Duplicate</span>
            </button>
          </div>
          
          {/* Zoom controls */}
          <div className={styles.zoomControls}>
            <button
              className={styles.zoomButton}
              onClick={handleZoomOut}
              title="Zoom out timeline (decrease zoom level)"
            >
              −
            </button>
            <button
              className={styles.zoomButton}
              onClick={handleZoomToFit}
              title="Zoom to fit all clips in view"
            >
              ⊡
            </button>
            <button
              className={styles.zoomButton}
              onClick={handleZoomIn}
              title="Zoom in timeline (increase zoom level)"
            >
              +
            </button>
          </div>
          
          {tracks.length < 3 && (
            <button
              className={styles.addTrackButton}
              onClick={handleAddOverlayTrack}
              title="Add overlay track for picture-in-picture"
            >
              + Track
            </button>
          )}
          <button
            className={styles.resetButton}
            onClick={handleReset}
            title="Clear all clips and reset app state"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
            </svg>
          </button>
          <button
            className={styles.exportButton}
            onClick={onExportClick}
            disabled={clips.length === 0}
            title="Export timeline to video file"
          >
            Export
          </button>
        </div>
      </div>
      
      <div 
        className={styles.timelineContent} 
        ref={scrollContainerRef}
        onClick={handleTimelineClick}
      >
        <>
          {clips.length > 0 && (
            <div className={styles.timelineRuler} style={{ width: `${totalWidth}px` }} key={`ruler-${clips.length}-${maxDuration}`}>
              {ticks.map(tick => (
                <div
                  key={tick}
                  className={styles.tick}
                  style={{ left: `${tick * zoom}px` }}
                >
                  <span className={styles.tickLabel}>{formatTime(tick)}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className={styles.tracksContainer} style={{ width: `${totalWidth}px` }}>
            {tracks.sort((a, b) => a.order - b.order).map(track => {
              const trackClips = clips.filter(c => c.trackId === track.id);
              return (
                <div 
                  key={track.id} 
                  className={`${styles.track} ${track.type === 'overlay' ? styles.overlayTrack : ''}`}
                  style={{ height: `${track.height}px` }}
                  onDrop={(e) => handleDrop(e, track.id)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <div className={styles.trackHeader}>
                    <span className={styles.trackName}>{track.name}</span>
                    <div className={styles.trackControls}>
                      <button
                        className={`${styles.muteButton} ${track.muted ? styles.muted : ''}`}
                        onClick={() => toggleTrackMute(track.id)}
                        title={track.muted ? 'Unmute track' : 'Mute track'}
                      >
                        {track.muted ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
                          </svg>
                        )}
                      </button>
                      {track.type === 'overlay' && (
                        <button
                          className={styles.removeTrackButton}
                          onClick={() => removeTrack(track.id)}
                          title="Remove track"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  {trackClips.length === 0 ? (
                    <div className={styles.emptyTrack}>
                      Drop clips here
                    </div>
                  ) : (
                    trackClips.map(clip => (
                      <TimelineClip
                        key={clip.id}
                        clip={clip}
                        zoom={zoom}
                        isSelected={clip.id === storeSelectedClipId}
                        onSelect={() => handleClipSelect(clip.id, clip.mediaClipId)}
                        onTrimUpdate={(trimStart, trimEnd) => updateClipTrim(clip.id, trimStart, trimEnd)}
                        onDelete={() => removeClipFromTimeline(clip.id)}
                      />
                    ))
                  )}
                  
                  {/* Selection overlay - show when in/out points are set */}
                  {selectionInPoint !== null && selectionOutPoint !== null && (
                    <div
                      className={styles.selectionOverlay}
                      style={{
                        left: `${Math.min(selectionInPoint, selectionOutPoint) * zoom}px`,
                        width: `${Math.abs(selectionOutPoint - selectionInPoint) * zoom}px`,
                      }}
                    />
                  )}
                  
                  {/* In/Out point markers */}
                  {selectionInPoint !== null && (
                    <div
                      className={styles.selectionMarker}
                      style={{ left: `${selectionInPoint * zoom}px` }}
                      title={`IN: ${selectionInPoint.toFixed(2)}s`}
                    >
                      <div className={styles.markerLabel}>IN</div>
                    </div>
                  )}
                  {selectionOutPoint !== null && (
                    <div
                      className={styles.selectionMarker}
                      style={{ left: `${selectionOutPoint * zoom}px` }}
                      title={`OUT: ${selectionOutPoint.toFixed(2)}s`}
                    >
                      <div className={styles.markerLabel}>OUT</div>
                    </div>
                  )}
                  
                  {/* Playhead - show on all tracks with clips */}
                  {trackClips.length > 0 && (
                    <div
                      className={styles.playhead}
                      style={{ left: `${playheadPosition * zoom}px` }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      </div>
    </div>
  );
};

