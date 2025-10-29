import React, { useState, useRef, useEffect } from 'react';
import { useTimelineStore } from '../../store/timelineStore';
import { useProjectStore } from '../../store/projectStore';
import { TimelineClip } from './TimelineClip';
import styles from './Timeline.module.css';

interface Props {
  onExportClick: () => void;
}

export const Timeline: React.FC<Props> = ({ onExportClick }) => {
  const { clips, playheadPosition, updateClipTrim, addClipToTimeline, removeClipFromTimeline, selectTimelineClip } = useTimelineStore();
  const selectedClipId = useProjectStore(state => state.selectedClipId);
  const selectClip = useProjectStore(state => state.selectClip);
  
  const [selectedTimelineClipId, setSelectedTimelineClipId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
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
    setSelectedTimelineClipId(timelineClipId);
    selectTimelineClip(timelineClipId); // Update timeline store selection
    if (selectedClipId) {
      selectClip(''); // Clear media library selection
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTimelineClipId) {
          e.preventDefault();
          removeClipFromTimeline(selectedTimelineClipId);
          setSelectedTimelineClipId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTimelineClipId, removeClipFromTimeline]);
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const data = e.dataTransfer.getData('application/clipforge-clip');
    if (data) {
      try {
        const { id, duration } = JSON.parse(data);
        addClipToTimeline(id, duration);
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
    if (e.target === e.currentTarget) {
      setSelectedTimelineClipId(null);
    }
  };
  
  const handleReset = () => {
    if (confirm('Clear all data? This will remove all imported videos and timeline clips. This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };
  
  return (
    <div className={styles.timeline}>
      <div className={styles.header}>
        <div className={styles.title}>Timeline</div>
        <div className={styles.controls}>
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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleTimelineClick}
        style={{ background: isDragOver ? '#2a2a2a' : undefined }}
      >
        {clips.length === 0 ? (
          <div className={styles.empty}>
            Drop clips from the Media Library to the Timeline
          </div>
        ) : (
          <>
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
            
            <div className={styles.tracksContainer} style={{ width: `${totalWidth}px` }}>
              <div className={styles.track}>
                {clips.map(clip => (
                  <TimelineClip
                    key={clip.id}
                    clip={clip}
                    zoom={zoom}
                    isSelected={clip.id === selectedTimelineClipId}
                    onSelect={() => handleClipSelect(clip.id, clip.mediaClipId)}
                    onTrimUpdate={(trimStart, trimEnd) => updateClipTrim(clip.id, trimStart, trimEnd)}
                    onDelete={() => removeClipFromTimeline(clip.id)}
                  />
                ))}
              </div>
              
              {/* Playhead */}
              <div
                className={styles.playhead}
                style={{ left: `${playheadPosition * zoom}px` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

