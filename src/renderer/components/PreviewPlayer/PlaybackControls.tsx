import React from 'react';
import { formatTime } from '../../utils/timeFormatters';
import { useTimelineStore } from '../../store/timelineStore';
import styles from './PlaybackControls.module.css';

interface Props {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
}

export const PlaybackControls: React.FC<Props> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onVolumeChange,
}) => {
  const showCentiseconds = useTimelineStore(state => state.showCentiseconds);
  
  // Safe wrapper for formatTime to handle edge cases
  const safeFormatTime = (seconds: number) => {
    if (!isFinite(seconds)) return showCentiseconds ? '0:00.00' : '0:00';
    return formatTime(seconds, showCentiseconds);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div className={styles.controls}>
      <button onClick={onPlayPause} className={styles.playButton} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className={styles.timeDisplay}>
        {safeFormatTime(currentTime)} / {safeFormatTime(duration)}
      </div>

      <div className={styles.volumeContainer}>
        <button className={styles.volumeIcon} onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}>
          {volume === 0 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
          className={styles.volumeBar}
        />
      </div>
    </div>
  );
};

