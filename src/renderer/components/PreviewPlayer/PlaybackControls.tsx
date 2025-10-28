import React from 'react';
import styles from './PlaybackControls.module.css';

interface Props {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

export const PlaybackControls: React.FC<Props> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
}) => {
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.controls}>
      <button onClick={onPlayPause} className={styles.playButton} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '⏸' : '▶'}
      </button>

      <div className={styles.timeline}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <div className={styles.seekBarContainer}>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeekBarChange}
            className={styles.seekBar}
            style={{
              background: `linear-gradient(to right, #0e639c ${progress}%, #3e3e42 ${progress}%)`,
            }}
          />
        </div>
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>

      <div className={styles.volumeContainer}>
        <span className={styles.volumeIcon}>{volume === 0 ? '🔇' : '🔊'}</span>
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

