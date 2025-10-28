import React, { useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { PlaybackControls } from './PlaybackControls';
import styles from './PreviewPlayer.module.css';

export const PreviewPlayer: React.FC = () => {
  const clips = useProjectStore((state) => state.clips);
  const selectedClipId = useProjectStore((state) => state.selectedClipId);

  const {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    changeVolume,
  } = useVideoPlayer();

  const selectedClip = clips.find((c) => c.id === selectedClipId);

  useEffect(() => {
    // Reload video when selection changes
    if (videoRef.current && selectedClip) {
      videoRef.current.load();
    }
  }, [selectedClip]);

  // Keyboard shortcut: Space to play/pause
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && selectedClip) {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedClip, togglePlayPause]);

  return (
    <div className={styles.previewPlayer}>
      <div className={styles.videoContainer}>
        {selectedClip ? (
          <video
            ref={videoRef}
            className={styles.video}
            src={`file://${selectedClip.filePath}`}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className={styles.noVideo}>
            <div className={styles.icon}>🎬</div>
            <div className={styles.text}>Select a clip to preview</div>
            <div className={styles.hint}>Import videos from the media library</div>
          </div>
        )}
      </div>

      {selectedClip && (
        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onPlayPause={togglePlayPause}
          onSeek={seek}
          onVolumeChange={changeVolume}
        />
      )}
    </div>
  );
};

