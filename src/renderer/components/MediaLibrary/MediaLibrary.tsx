import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useMediaImport } from '../../hooks/useMediaImport';
import { MediaClipItem } from './MediaClipItem';
import styles from './MediaLibrary.module.css';

export const MediaLibrary: React.FC = () => {
  const clips = useProjectStore((state) => state.clips);
  const selectedClipId = useProjectStore((state) => state.selectedClipId);
  const selectClip = useProjectStore((state) => state.selectClip);
  const { importFiles, importing, error } = useMediaImport();

  return (
    <div className={styles.mediaLibrary}>
      <div className={styles.header}>
        <h2>Media Library</h2>
        <button
          className={styles.importButton}
          onClick={importFiles}
          disabled={importing}
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
          />
        ))}
      </div>
    </div>
  );
};

