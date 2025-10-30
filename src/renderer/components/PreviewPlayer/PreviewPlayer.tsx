import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { useTimelineStore } from '../../store/timelineStore';
import type { TimelineClip } from '../../store/timelineStore';
import { useVideoPlayer } from '../../hooks/useVideoPlayer';
import { PlaybackControls } from './PlaybackControls';
import { MediaClip } from '../../types/media.types';
import styles from './PreviewPlayer.module.css';

const EPSILON = 1e-3;

type PlaySegment = {
  timelineStart: number;
  timelineEnd: number;
  videoOffset: number;
  clipId: string;
  media: MediaClip;
};

const buildSegments = (clips: TimelineClip[], mediaClips: MediaClip[]): PlaySegment[] => {
  const mediaMap = new Map(mediaClips.map((clip) => [clip.id, clip]));
  return [...clips]
    .sort((a, b) => a.startTime - b.startTime)
    .map((clip): PlaySegment | null => {
      const media = mediaMap.get(clip.mediaClipId);
      if (!media) {
        return null;
      }
      const start = clip.startTime + clip.trimStart;
      const end = clip.startTime + clip.originalDuration - clip.trimEnd;
      if (end - start <= EPSILON) {
        return null;
      }
      const segment: PlaySegment = {
        timelineStart: start,
        timelineEnd: end,
        videoOffset: clip.trimStart,
        clipId: clip.id,
        media,
      };
      return segment;
    })
    .filter((segment): segment is PlaySegment => segment !== null);
};

const findSegmentForTime = (segments: PlaySegment[], timelineTime: number): PlaySegment | null => {
  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;
    const startOk = timelineTime >= segment.timelineStart - EPSILON;
    const endOk = isLast
      ? timelineTime <= segment.timelineEnd + EPSILON
      : timelineTime < segment.timelineEnd - EPSILON;

    if (startOk && endOk) {
      return segment;
    }
  }
  return null;
};

interface PreviewPlayerProps {
  onPlayPauseHandlerReady?: (handler: () => void) => void;
}

export const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ onPlayPauseHandlerReady }) => {
  const clips = useProjectStore((state) => state.clips);
  const timelineClips = useTimelineStore((state) => state.clips);
  const playheadPosition = useTimelineStore((state) => state.playheadPosition);
  const setPlayheadPosition = useTimelineStore((state) => state.setPlayheadPosition);
  const selectTimelineClip = useTimelineStore((state) => state.selectTimelineClip);
  const totalDuration = useTimelineStore((state) => state.duration);

  const { videoRef, isPlaying, togglePlayPause: rawTogglePlayPause, changeVolume, volume } = useVideoPlayer();

  const segments = useMemo(() => buildSegments(timelineClips, clips), [timelineClips, clips]);

  const [activeMedia, setActiveMedia] = useState<MediaClip | null>(null);
  const shouldResumeRef = useRef(false);

  const goToSegment = useCallback(
    (segment: PlaySegment, resume: boolean) => {
      setActiveMedia(segment.media);
      selectTimelineClip(segment.clipId);
      setPlayheadPosition(segment.timelineStart);
      shouldResumeRef.current = resume;
    },
    [selectTimelineClip, setPlayheadPosition],
  );

  useEffect(() => {
    if (!segments.length) {
      setActiveMedia(null);
      return;
    }

    const segment = findSegmentForTime(segments, playheadPosition);
    if (!segment) {
      const first = segments[0];
      setPlayheadPosition(first.timelineStart);
      setActiveMedia(first.media);
      selectTimelineClip(first.clipId);
      return;
    }

    setActiveMedia(segment.media);
    selectTimelineClip(segment.clipId);

    const video = videoRef.current;
    if (!video) {
      return;
    }

    const desiredVideoTime = segment.videoOffset + (playheadPosition - segment.timelineStart);
    const syncVideo = () => {
      if (Math.abs(video.currentTime - desiredVideoTime) > 0.01) {
        video.currentTime = Math.max(0, desiredVideoTime);
      }
      if (shouldResumeRef.current) {
        shouldResumeRef.current = false;
        video.play().catch(() => undefined);
      }
    };

    if (video.readyState >= 1) {
      syncVideo();
    } else {
      const handleLoaded = () => {
        video.removeEventListener('loadedmetadata', handleLoaded);
        syncVideo();
      };
      video.addEventListener('loadedmetadata', handleLoaded);
    }
  }, [segments, playheadPosition, selectTimelineClip, setPlayheadPosition, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) {
      return;
    }

    let rafId = 0;

    const updatePlayhead = () => {
      const segment = findSegmentForTime(segments, useTimelineStore.getState().playheadPosition);
      if (!segment) {
        return;
      }

      const playableDuration = segment.timelineEnd - segment.timelineStart;
      const segmentEndVideoTime = segment.videoOffset + playableDuration;

      if (video.currentTime >= segmentEndVideoTime - EPSILON) {
        const index = segments.findIndex((item) => item.clipId === segment.clipId);
        const nextSegment = segments[index + 1];

        if (nextSegment) {
          goToSegment(nextSegment, true);
        } else {
          setPlayheadPosition(segment.timelineEnd);
          shouldResumeRef.current = false;
        }
        return;
      }

      const timelineTime = segment.timelineStart + (video.currentTime - segment.videoOffset);
      if (!Number.isNaN(timelineTime)) {
        const clamped = Math.max(segment.timelineStart, Math.min(segment.timelineEnd, timelineTime));
        if (Math.abs(clamped - useTimelineStore.getState().playheadPosition) > EPSILON) {
          setPlayheadPosition(clamped);
        }
      }
    };

    const tick = () => {
      updatePlayhead();
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [goToSegment, segments, isPlaying, setPlayheadPosition, videoRef]);

  const handlePlayPause = useCallback(() => {
    if (!segments.length) {
      return;
    }

    const video = videoRef.current;

    const firstSegment = segments[0];
    const lastSegment = segments[segments.length - 1];
    const currentSegment = findSegmentForTime(segments, playheadPosition);

    const atTimelineEnd = Math.abs(playheadPosition - lastSegment.timelineEnd) <= EPSILON;
    const atSegmentEnd = currentSegment
      ? Math.abs(playheadPosition - currentSegment.timelineEnd) <= EPSILON
      : false;

    if (atTimelineEnd || (!currentSegment && playheadPosition > lastSegment.timelineEnd - EPSILON)) {
      goToSegment(firstSegment, true);
      if (video) {
        video.pause();
      }
      return;
    }

    if (currentSegment && atSegmentEnd && segments.length > 1) {
      const index = segments.findIndex((segment) => segment.clipId === currentSegment.clipId);
      const nextSegment = segments[index + 1];
      if (nextSegment) {
        goToSegment(nextSegment, true);
        if (video) {
          video.pause();
        }
        return;
      }
    }

    if (!video) {
      return;
    }

    rawTogglePlayPause();
  }, [goToSegment, segments, playheadPosition, rawTogglePlayPause, videoRef]);

  // Expose play/pause handler to parent for keyboard shortcuts
  useEffect(() => {
    if (onPlayPauseHandlerReady) {
      onPlayPauseHandlerReady(handlePlayPause);
    }
  }, [handlePlayPause, onPlayPauseHandlerReady]);

  const currentSource = activeMedia ? `file://${activeMedia.filePath}` : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const handleEnded = () => {
      if (!segments.length) {
        return;
      }

      const currentPosition = useTimelineStore.getState().playheadPosition;
      const currentSegment = findSegmentForTime(segments, currentPosition) || segments[segments.length - 1];
      const index = segments.findIndex((segment) => segment.clipId === currentSegment.clipId);

      if (index === -1) {
        return;
      }

      const nextSegment = segments[index + 1];

      if (!nextSegment) {
        setPlayheadPosition(currentSegment.timelineEnd);
        return;
      }

      goToSegment(nextSegment, true);
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('ended', handleEnded);
    };
  }, [goToSegment, segments, setActiveMedia, setPlayheadPosition, videoRef]);

  return (
    <div className={styles.previewPlayer}>
      <div className={styles.videoContainer}>
        {activeMedia ? (
          <video
            key={activeMedia.id}
            ref={videoRef}
            className={styles.video}
            src={currentSource}
            preload="auto"
            playsInline
            crossOrigin="anonymous"
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <div className={styles.noVideo}>
            <div className={styles.icon}>🎬</div>
            <div className={styles.text}>Drop clips on the timeline to preview</div>
          </div>
        )}
      </div>

      {segments.length > 0 && (
        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={playheadPosition}
          duration={totalDuration}
          volume={volume}
          onPlayPause={handlePlayPause}
          onVolumeChange={changeVolume}
        />
      )}
    </div>
  );
};
