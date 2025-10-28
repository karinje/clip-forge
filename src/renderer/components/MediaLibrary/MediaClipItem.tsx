import React from 'react';
import { MediaClip } from '../../types/media.types';
import styles from './MediaClipItem.module.css';

interface Props {
  clip: MediaClip;
  isSelected: boolean;
  onSelect: () => void;
}

export const MediaClipItem: React.FC<Props> = ({ clip, isSelected, onSelect }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div
      className={`${styles.clipItem} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
    >
      <div className={styles.thumbnail}>
        <div className={styles.playIcon}>▶</div>
        <div className={styles.duration}>{formatDuration(clip.duration)}</div>
      </div>
      <div className={styles.info}>
        <div className={styles.name} title={clip.name}>{clip.name}</div>
        <div className={styles.metadata}>
          {clip.resolution.width}×{clip.resolution.height}
          {clip.fps && ` • ${Math.round(clip.fps)}fps`}
        </div>
        <div className={styles.size}>{formatFileSize(clip.fileSize)}</div>
      </div>
    </div>
  );
};

