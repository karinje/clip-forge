import React, { useEffect, useState, useRef } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useTimelineStore } from '../../store/timelineStore';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { PlaybackControls } from './PlaybackControls';
import styles from './PreviewPlayer.module.css';

export const PreviewPlayer: React.FC = () => {
  const clips = useProjectStore((state) => state.clips);
  const selectedClipId = useProjectStore((state) => state.selectedClipId);
  const timelineClips = useTimelineStore((state) => state.clips);
  const selectedTimelineClipId = useTimelineStore((state) => state.selectedTimelineClipId);
  const [videoKey, setVideoKey] = useState(0);

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

  // Timeline composition: track which clip index we're currently playing
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  
  // Track absolute timeline position (sum of all clips up to current point)
  const [absoluteTimelinePosition, setAbsoluteTimelinePosition] = useState(0);
  
  const hasTimelineClips = timelineClips.length > 0;

  const prevTrimRef = useRef({ trimStart: 0, trimEnd: 0 });
  const lastClipIndexRef = useRef<number | null>(null);
  
  // If a timeline clip is selected, use it; otherwise use the playing index
  const currentTimelineClip = hasTimelineClips 
    ? (selectedTimelineClipId 
        ? timelineClips.find(c => c.id === selectedTimelineClipId) || timelineClips[currentClipIndex]
        : timelineClips[currentClipIndex])
    : null;
    
  const selectedClip = currentTimelineClip
    ? clips.find((c) => c.id === currentTimelineClip.mediaClipId)
    : clips.find((c) => c.id === selectedClipId);
  
  const selectedTimelineClip = currentTimelineClip;
  
  // Calculate total trimmed duration of all timeline clips
  const totalTrimmedDuration = hasTimelineClips 
    ? timelineClips.reduce((sum, clip) => sum + clip.duration, 0)
    : duration;

  // Force video reload when timeline clips change (e.g., when dropped)
  useEffect(() => {
    setCurrentClipIndex(0); // Reset to first clip
    setAbsoluteTimelinePosition(0); // Reset position to start
    setVideoKey(prev => prev + 1);
  }, [timelineClips.length]);

  // When a timeline clip is selected, jump to that clip and its trimStart
  useEffect(() => {
    if (!hasTimelineClips) {
      setCurrentClipIndex(0);
      setAbsoluteTimelinePosition(0);
      prevTrimRef.current = { trimStart: 0, trimEnd: 0 };
      lastClipIndexRef.current = null;
      return;
    }

    if (!selectedTimelineClipId) {
      const firstClip = timelineClips[0];
      const nextIndex = firstClip ? 0 : -1;

      setCurrentClipIndex(prev => (nextIndex >= 0 ? (prev === nextIndex ? prev : nextIndex) : prev));
      if (nextIndex >= 0) {
        if (lastClipIndexRef.current !== nextIndex) {
          setVideoKey(prev => prev + 1);
          lastClipIndexRef.current = nextIndex;
        }

        setAbsoluteTimelinePosition(0);
        prevTrimRef.current = {
          trimStart: firstClip!.trimStart,
          trimEnd: firstClip!.trimEnd,
        };
      }
      return;
    }

    const clipIndex = timelineClips.findIndex(c => c.id === selectedTimelineClipId);
    if (clipIndex === -1) {
      return;
    }

    setCurrentClipIndex(prev => (prev === clipIndex ? prev : clipIndex));

    if (lastClipIndexRef.current !== clipIndex) {
      setVideoKey(prev => prev + 1);
      lastClipIndexRef.current = clipIndex;
    }

    const positionBeforeCurrentClip = timelineClips
      .slice(0, clipIndex)
      .reduce((sum, clip) => sum + clip.duration, 0);

    setAbsoluteTimelinePosition(positionBeforeCurrentClip);
    prevTrimRef.current = {
      trimStart: timelineClips[clipIndex].trimStart,
      trimEnd: timelineClips[clipIndex].trimEnd,
    };
  }, [selectedTimelineClipId, hasTimelineClips, timelineClips]);

  useEffect(() => {
    if (!hasTimelineClips) {
      return;
    }

    if (currentClipIndex < 0 || currentClipIndex >= timelineClips.length) {
      return;
    }

    const activeTimelineClip = timelineClips[currentClipIndex];
    if (!activeTimelineClip) {
      return;
    }

    const positionBeforeCurrentClip = timelineClips
      .slice(0, currentClipIndex)
      .reduce((sum, clip) => sum + clip.duration, 0);

    let relativePosition = 0;
    if (videoRef.current) {
      relativePosition = Math.max(0, videoRef.current.currentTime - activeTimelineClip.trimStart);
      relativePosition = Math.min(relativePosition, activeTimelineClip.duration);
    }

    const targetPosition = positionBeforeCurrentClip + relativePosition;

    setAbsoluteTimelinePosition(prev => (
      Math.abs(prev - targetPosition) > 0.001 ? targetPosition : prev
    ));
  }, [timelineClips, currentClipIndex, hasTimelineClips]);
  
  // When trim values change on the selected clip, update video position
  useEffect(() => {
    if (!videoRef.current || !selectedTimelineClip || !selectedClip) return;

    const video = videoRef.current;

    const applyTrimUpdate = () => {
      const prevTrimStart = prevTrimRef.current.trimStart;
      const prevTrimEnd = prevTrimRef.current.trimEnd;

      const trimStartChanged = selectedTimelineClip.trimStart !== prevTrimStart;
      const trimEndChanged = selectedTimelineClip.trimEnd !== prevTrimEnd;

      if (!trimStartChanged && !trimEndChanged) {
        return;
      }

      const positionBeforeCurrentClip = timelineClips
        .slice(0, currentClipIndex)
        .reduce((sum, tlClip) => sum + tlClip.duration, 0);

      if (!video.paused) {
        video.pause();
      }

      if (trimStartChanged) {
        video.currentTime = selectedTimelineClip.trimStart;
        setAbsoluteTimelinePosition(positionBeforeCurrentClip);
        console.log(`[TRIM] Start changed for clip ${currentClipIndex}, position=${positionBeforeCurrentClip.toFixed(2)}`);
      }

      if (trimEndChanged) {
        const newEndPosition = selectedClip.duration - selectedTimelineClip.trimEnd;
        video.currentTime = newEndPosition;
        const finalPosition = positionBeforeCurrentClip + selectedTimelineClip.duration;
        setAbsoluteTimelinePosition(finalPosition);
        console.log(`[TRIM] End changed for clip ${currentClipIndex}, sum(prev)=${positionBeforeCurrentClip.toFixed(2)}, current.duration=${selectedTimelineClip.duration.toFixed(2)}, final=${finalPosition.toFixed(2)}`);
      }

      prevTrimRef.current = {
        trimStart: selectedTimelineClip.trimStart,
        trimEnd: selectedTimelineClip.trimEnd
      };
    };

    if (video.readyState >= 2) {
      applyTrimUpdate();
      return;
    }

    const handleCanPlay = () => {
      applyTrimUpdate();
      video.removeEventListener('canplay', handleCanPlay);
    };

    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [selectedTimelineClip?.trimStart, selectedTimelineClip?.trimEnd, selectedClip, timelineClips, currentClipIndex]);

  useEffect(() => {
    // Reload video when selection changes or videoKey changes
    if (videoRef.current && selectedClip) {
      
      const video = videoRef.current;
      
      // Force reload with explicit rendering hints
      video.load();
      
      // Wait for metadata to be loaded before attempting to render
      const handleLoadedMetadata = () => {
        
        // Set explicit dimensions to force rendering
        if (video.videoWidth && video.videoHeight) {
          video.style.width = '100%';
          video.style.height = '100%';
        }
        
        // If there's a timeline clip with trim, seek to the trimmed start point
        if (selectedTimelineClip && selectedTimelineClip.trimStart > 0) {
          video.currentTime = selectedTimelineClip.trimStart;
        }
        
        // Calculate correct absolute position for this clip
        const positionBeforeCurrentClip = timelineClips
          .slice(0, currentClipIndex)
          .reduce((sum, clip) => sum + clip.duration, 0);
        setAbsoluteTimelinePosition(positionBeforeCurrentClip);
        
        // Try to play briefly to initialize rendering pipeline
        video.play()
          .then(() => {
            video.pause();
            if (selectedTimelineClip && selectedTimelineClip.trimStart > 0) {
              video.currentTime = selectedTimelineClip.trimStart;
            } else {
              video.currentTime = 0;
            }
          })
          .catch((err) => {
            // Ignore AbortError - it happens when video is changed during loading
            if (err.name !== 'AbortError') {
              console.error('Video play error:', err);
            }
          });
      };
      
      if (video.readyState >= 1) {
        // Metadata already loaded
        handleLoadedMetadata();
      } else {
        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
      }
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [selectedClip, videoKey]); // Removed selectedTimelineClip to prevent infinite reload

  // Enforce trim boundaries during playback AND update absolute timeline position
  useEffect(() => {
    if (!videoRef.current || !selectedTimelineClip) return;
    
    const video = videoRef.current;
    const trimEnd = selectedClip!.duration - selectedTimelineClip.trimEnd;
    
    // Calculate position up to current clip
    const positionBeforeCurrentClip = timelineClips
      .slice(0, currentClipIndex)
      .reduce((sum, clip) => sum + clip.duration, 0);
    
    const handleTimeUpdate = () => {
      // Update absolute timeline position
      const relativePosition = Math.max(0, video.currentTime - selectedTimelineClip.trimStart);
      setAbsoluteTimelinePosition(positionBeforeCurrentClip + relativePosition);
      
      // If video goes past trim end, advance to next clip or stop
      if (video.currentTime >= trimEnd) {
        
        // Check if there's a next clip
        if (hasTimelineClips && currentClipIndex < timelineClips.length - 1) {
          setCurrentClipIndex(currentClipIndex + 1);
          setVideoKey(prev => prev + 1); // Force reload
        } else {
          video.pause();
          video.currentTime = trimEnd;
        }
      }
      
      // If video goes before trim start, reset to trim start
      if (video.currentTime < selectedTimelineClip.trimStart) {
        video.currentTime = selectedTimelineClip.trimStart;
      }
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [selectedClip?.duration, selectedTimelineClip?.trimStart, selectedTimelineClip?.trimEnd, currentClipIndex, hasTimelineClips, timelineClips.length]); // Add dependencies for auto-advance

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
            key={`${selectedClip.id}-${videoKey}`}
            ref={videoRef}
            className={styles.video}
            src={`file://${selectedClip.filePath}`}
            preload="metadata"
            playsInline
            crossOrigin="anonymous"
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
          currentTime={absoluteTimelinePosition}
          duration={totalTrimmedDuration}
          volume={volume}
          onPlayPause={togglePlayPause}
          onSeek={seek}
          onVolumeChange={changeVolume}
        />
      )}
    </div>
  );
};
