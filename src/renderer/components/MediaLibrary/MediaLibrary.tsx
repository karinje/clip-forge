import React, { useEffect, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useMediaImport } from '../../hooks/useMediaImport';
import { MediaClipItem } from './MediaClipItem';
import styles from './MediaLibrary.module.css';

export const MediaLibrary: React.FC = () => {
  const clips = useProjectStore((state) => state.clips);
  const selectedClipId = useProjectStore((state) => state.selectedClipId);
  const selectClip = useProjectStore((state) => state.selectClip);
  const removeClip = useProjectStore((state) => state.removeClip);
  const { importFiles, importing, error, importFromPaths } = useMediaImport();
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    console.log('📦 Drop event:', e.dataTransfer);
    
    // Get files from drop event
    const files = Array.from(e.dataTransfer.files);
    console.log('📦 Files dropped:', files);
    
    // Use Electron's webUtils to get file paths (works with context isolation)
    const videoPaths: string[] = [];
    
    for (const file of files) {
      console.log('📁 Processing file:', file.name);
      
      try {
        // Use the preload-exposed function to get file path
        const path = window.electronAPI.getFilePathFromFile(file);
        console.log('📂 Got path:', path);
        
        if (path) {
          videoPaths.push(path);
        }
      } catch (err) {
        console.error('❌ Error getting file path:', err);
      }
    }
    
    console.log('🎬 Video paths to import:', videoPaths);
    
    if (videoPaths.length > 0) {
      console.log('✅ Starting import of', videoPaths.length, 'files');
      await importFromPaths(videoPaths);
    } else {
      console.log('❌ No valid file paths found');
      alert('Unable to import files via drag-and-drop. Please use the Import button instead.');
    }
  };

  return (
    <div 
      className={`${styles.mediaLibrary} ${isDraggingOver ? styles.draggingOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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

