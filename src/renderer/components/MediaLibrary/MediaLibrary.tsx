import React, { useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useMediaImport } from '../../hooks/useMediaImport';
import { MediaClipItem } from './MediaClipItem';
import styles from './MediaLibrary.module.css';

export const MediaLibrary: React.FC = () => {
  const clips = useProjectStore((state) => state.clips);
  const selectedClipId = useProjectStore((state) => state.selectedClipId);
  const selectClip = useProjectStore((state) => state.selectClip);
  const removeClip = useProjectStore((state) => state.removeClip);
  const { importFiles, importing, error } = useMediaImport();

  // Keyboard shortcut to delete selected media clip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          removeClip(selectedClipId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, removeClip]);

  return (
    <div className={styles.mediaLibrary}>
      <div className={styles.header}>
        <h2>Media Library</h2>
        <button
          className={styles.importButton}
          onClick={importFiles}
          disabled={importing}
          title="Import video files (MP4, MOV, WebM)"
        >
          {importing ? 'Importing...' : '+ Import'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.clipList}>
        {clips.length === 0 && !importing && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📹</div>
            <div className={styles.emptyText}>No clips imported</div>
            <div className={styles.emptyHint}>Click Import to add videos</div>
          </div>
        )}

        {clips.map((clip) => (
          <MediaClipItem
            key={clip.id}
            clip={clip}
            isSelected={clip.id === selectedClipId}
            onSelect={() => selectClip(clip.id)}
            onDelete={() => removeClip(clip.id)}
          />
        ))}
      </div>
    </div>
  );
};

