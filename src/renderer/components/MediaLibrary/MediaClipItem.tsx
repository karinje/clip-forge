import React from 'react';
import { MediaClip } from '../../types/media.types';
import styles from './MediaClipItem.module.css';

interface Props {
  clip: MediaClip;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export const MediaClipItem: React.FC<Props> = ({ clip, isSelected, onSelect, onDelete }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/clipforge-clip', JSON.stringify({
      id: clip.id,
      duration: clip.duration,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={`${styles.clipItem} ${isSelected ? styles.selected : ''}`}
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
    >
      <div className={styles.thumbnail}>
        {clip.thumbnail && (
          <img src={clip.thumbnail} alt={clip.name} className={styles.thumbnailImage} />
        )}
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
      <button
        className={styles.deleteButton}
        onClick={handleDelete}
        title="Delete clip"
      >
        ×
      </button>
    </div>
  );
};

