import React, { useState, useRef, useEffect } from 'react';
import { TimelineClip as TimelineClipType } from '../../store/timelineStore';
import { useProjectStore } from '../../store/projectStore';
import styles from './TimelineClip.module.css';

interface Props {
  clip: TimelineClipType;
  zoom: number;
  isSelected: boolean;
  onSelect: () => void;
  onTrimUpdate: (trimStart: number, trimEnd: number) => void;
  onDelete: () => void;
}

export const TimelineClip: React.FC<Props> = ({
  clip,
  zoom,
  isSelected,
  onSelect,
  onTrimUpdate,
  onDelete,
}) => {
  const clips = useProjectStore(state => state.clips);
  const mediaClip = clips.find(c => c.id === clip.mediaClipId);
  
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const [trimThumbnail, setTrimThumbnail] = useState<string | undefined>(mediaClip?.thumbnail);
  const dragStartX = useRef(0);
  const originalTrimStart = useRef(0);
  const originalTrimEnd = useRef(0);
  const lastTrimStart = useRef(0);

  // Update thumbnail ONLY when dragging stops and trimStart changed significantly
  useEffect(() => {
    if (!isDraggingLeft && !isDraggingRight && mediaClip) {
      // Only update if trim changed by at least 1 second OR went back to 0
      const trimChanged = Math.abs(clip.trimStart - lastTrimStart.current) >= 1;
      const wentBackToZero = lastTrimStart.current > 0 && clip.trimStart === 0;
      
      if (trimChanged || wentBackToZero) {
        lastTrimStart.current = clip.trimStart;
        
        if (clip.trimStart > 0) {
          window.electronAPI.getVideoThumbnail(mediaClip.filePath, clip.trimStart)
            .then(result => {
              if (result.success) {
                setTrimThumbnail(result.data);
              }
            });
        } else {
          // Reset to original first-frame thumbnail
          setTrimThumbnail(mediaClip.thumbnail);
        }
      }
    }
  }, [clip.trimStart, isDraggingLeft, isDraggingRight, mediaClip]);
  
  if (!mediaClip) return null;
  
  const containerStyle: React.CSSProperties = {
    left: `${clip.startTime * zoom}px`,
    width: `${clip.originalDuration * zoom}px`,
  };

  const surfaceStyle: React.CSSProperties = {
    left: `${clip.trimStart * zoom}px`,
    width: `${clip.duration * zoom}px`,
  };
  const originalDuration = clip.originalDuration;
  
  const handleLeftMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(); // Auto-select this clip when trim handle is dragged
    setIsDraggingLeft(true);
    dragStartX.current = e.clientX;
    originalTrimStart.current = clip.trimStart;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaSeconds = deltaX / zoom;
      const newTrimStart = Math.max(0, Math.min(
        originalDuration - clip.trimEnd - 0.1,
        originalTrimStart.current + deltaSeconds
      ));
      onTrimUpdate(newTrimStart, clip.trimEnd);
    };
    
    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleRightMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(); // Auto-select this clip when trim handle is dragged
    setIsDraggingRight(true);
    dragStartX.current = e.clientX;
    originalTrimEnd.current = clip.trimEnd;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaSeconds = -deltaX / zoom; // Negative because trimming from end
      const newTrimEnd = Math.max(0, Math.min(
        originalDuration - clip.trimStart - 0.1,
        originalTrimEnd.current + deltaSeconds
      ));
      onTrimUpdate(clip.trimStart, newTrimEnd);
    };
    
    const handleMouseUp = () => {
      setIsDraggingRight(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };
  
  return (
    <div
      className={`${styles.timelineClip} ${isSelected ? styles.selected : ''}`}
      style={containerStyle}
      onClick={onSelect}
    >
      {clip.trimStart > 0 && (
        <div
          className={styles.trimmedRegionLeft}
          style={{ width: `${clip.trimStart * zoom}px` }}
        />
      )}

      <div
        className={styles.clipSurface}
        style={surfaceStyle}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        {trimThumbnail && (
          <div className={styles.thumbnailContainer}>
            <img src={trimThumbnail} alt={mediaClip.name} className={styles.thumbnail} />
          </div>
        )}

        <div
          className={`${styles.trimHandle} ${styles.left}`}
          onMouseDown={handleLeftMouseDown}
          title={`Start at: ${formatTime(clip.trimStart)}`}
        >
          {isDraggingLeft && (
            <div className={`${styles.trimLabel} ${styles.leftLabel}`}>{formatTime(clip.trimStart)}</div>
          )}
        </div>

        <div className={styles.clipContent}>
          <div className={styles.clipName}>{mediaClip.name}</div>
          <div className={styles.clipDuration}>{formatTime(clip.duration)}</div>
        </div>

        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Delete from timeline"
        >
          ×
        </button>

        <div
          className={`${styles.trimHandle} ${styles.right}`}
          onMouseDown={handleRightMouseDown}
          title={`End at: ${formatTime(originalDuration - clip.trimEnd)}`}
        >
          {isDraggingRight && (
            <div className={`${styles.trimLabel} ${styles.rightLabel}`}>{formatTime(originalDuration - clip.trimEnd)}</div>
          )}
        </div>
      </div>

      {clip.trimEnd > 0 && (
        <div
          className={styles.trimmedRegionRight}
          style={{ width: `${clip.trimEnd * zoom}px` }}
        />
      )}
    </div>
  );
};

