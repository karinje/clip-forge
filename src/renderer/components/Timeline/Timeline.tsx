import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../../store/timelineStore';
import { useProjectStore } from '../../store/projectStore';
import { TimelineClip } from './TimelineClip';
import styles from './Timeline.module.css';

interface Props {
  onExportClick: () => void;
}

export const Timeline: React.FC<Props> = ({ onExportClick }) => {
  const { 
    clips, 
    tracks, 
    playheadPosition, 
    setPlayheadPosition,
    updateClipTrim, 
    addClipToTimeline, 
    removeClipFromTimeline, 
    selectTimelineClip, 
    splitClipAtPlayhead,
    addTrack,
    removeTrack,
    toggleTrackMute,
    selectedTimelineClipId: storeSelectedClipId
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
  
  // Calculate zoom to fit timeline in available width
  const containerWidth = scrollContainerRef.current?.clientWidth || 800;
  const zoom = maxDuration > 0 ? (containerWidth - 100) / maxDuration : 10;
  const totalWidth = maxDuration * zoom;
  
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
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (storeSelectedClipId) {
          e.preventDefault();
          removeClipFromTimeline(storeSelectedClipId);
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        // Split clip at playhead (Cmd/Ctrl+K)
        if (storeSelectedClipId) {
          e.preventDefault();
          console.log('🔪 Splitting clip at playhead:', playheadPosition);
          splitClipAtPlayhead(storeSelectedClipId);
        } else {
          console.warn('⚠️ No clip selected. Click a clip first, then press Cmd+K to split.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [storeSelectedClipId, playheadPosition, removeClipFromTimeline, splitClipAtPlayhead]);
  
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
  
  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <div className={styles.title}>Timeline</div>
        <div className={styles.controls}>
          {tracks.length < 3 && (
            <button
              className={styles.addTrackButton}
              onClick={handleAddOverlayTrack}
              title="Add overlay track for picture-in-picture"
            >
              + Add Track
            </button>
          )}
          <button
            className={styles.resetButton}
            onClick={handleReset}
            title="Clear all data and reset app"
          >
            Reset
          </button>
          <button
            className={styles.exportButton}
            onClick={onExportClick}
            disabled={clips.length === 0}
          >
            Export Video
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
                        {track.muted ? '🔇' : '🔊'}
                      </button>
                      {track.type === 'overlay' && (
                        <button
                          className={styles.removeTrackButton}
                          onClick={() => removeTrack(track.id)}
                          title="Remove track"
                        >
                          ×
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

