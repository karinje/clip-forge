import React, { useRef, useEffect, useState } from 'react';
import styles from './PreviewCompositionModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  previewPath: string;
  onSaveAs: () => void;
  isGenerating: boolean;
  progress: number;
}

export const PreviewCompositionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  previewPath,
  onSaveAs,
  isGenerating,
  progress,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (videoRef.current && previewPath && !isGenerating) {
      videoRef.current.load();
    }
  }, [previewPath, isGenerating]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleClose = async () => {
    // Stop video
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    
    // Delete temp preview file
    if (previewPath) {
      await window.electronAPI.deleteFile(previewPath);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Preview Composition</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {isGenerating ? (
            <div className={styles.generating}>
              <div className={styles.spinner}></div>
              <p className={styles.generatingText}>Generating preview...</p>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.progressText}>{Math.round(progress)}%</p>
            </div>
          ) : (
            <div className={styles.videoContainer}>
              <video
                ref={videoRef}
                className={styles.video}
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={`file://${previewPath}`} type="video/mp4" />
              </video>
              
              <div className={styles.hint}>
                This is what your exported video will look like
              </div>
            </div>
          )}
        </div>

        {!isGenerating && (
          <div className={styles.footer}>
            <button className={styles.secondaryButton} onClick={handleClose}>
              Close & Discard
            </button>
            <button className={styles.primaryButton} onClick={onSaveAs}>
              💾 Save As...
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

