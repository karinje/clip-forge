import React from 'react';
import { useTimelineStore } from '../../store/timelineStore';
import { useProjectStore } from '../../store/projectStore';
import { formatTime } from '../../utils/timeFormatters';
import styles from './StatusBar.module.css';

export const StatusBar: React.FC = () => {
  const { playheadPosition, duration, selectedTimelineClipId, clips: timelineClips, zoom, showCentiseconds } = useTimelineStore();
  const mediaClips = useProjectStore(state => state.clips);
  
  const selectedClip = timelineClips.find(c => c.id === selectedTimelineClipId);
  const mediaClip = selectedClip ? mediaClips.find(mc => mc.id === selectedClip.mediaClipId) : null;
  
  return (
    <div className={styles.statusBar}>
      <div className={styles.section}>
        <span className={styles.label}>Playhead:</span>
        <span className={styles.value}>{formatTime(playheadPosition, showCentiseconds)} / {formatTime(duration, showCentiseconds)}</span>
      </div>
      
      {selectedClip && mediaClip && (
        <div className={styles.section}>
          <span className={styles.label}>Selected:</span>
          <span className={styles.value}>{mediaClip.name} ({formatTime(selectedClip.duration, showCentiseconds)})</span>
        </div>
      )}
      
      <div className={styles.section}>
        <span className={styles.label}>Zoom:</span>
        <span className={styles.value}>{zoom.toFixed(0)}px/s</span>
      </div>
      
      <div className={styles.section}>
        <span className={styles.label}>Clips:</span>
        <span className={styles.value}>{timelineClips.length}</span>
      </div>
    </div>
  );
};

