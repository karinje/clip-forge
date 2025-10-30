import { useRef, useState, useEffect } from 'react';

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const play = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const pause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      console.log('🎯 Seeking to:', time, 'readyState:', videoRef.current.readyState);
      // Ensure video is loaded enough to seek
      if (videoRef.current.readyState >= 2) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
        console.log('✅ Seeked to:', time);
      } else {
        console.log('⏳ Waiting for video to be ready...');
        // Wait for video to be ready, then seek
        const handleCanPlay = () => {
          if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
            console.log('✅ Seeked to:', time, '(after canplay)');
            videoRef.current.removeEventListener('canplay', handleCanPlay);
          }
        };
        videoRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  };

  const changeVolume = (newVolume: number) => {
    if (videoRef.current) {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      videoRef.current.volume = clampedVolume;
      setVolume(clampedVolume);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setCurrentTime(0);
    };
    
    const handleEnded = () => {
      console.log('🎬 Video ended event');
      setIsPlaying(false);
    };
    const handlePlay = () => {
      console.log('▶️ Video play event');
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log('⏸️ Video pause event');
      setIsPlaying(false);
    };

    // Listen to all events
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    // If metadata is already loaded, set duration immediately
    if (video.duration && !isNaN(video.duration)) {
      setDuration(video.duration);
      setCurrentTime(video.currentTime);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef.current?.src]); // Re-run when video source changes

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    togglePlayPause,
    seek,
    changeVolume,
  };
}

