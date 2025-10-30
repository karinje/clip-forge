/**
 * Time formatting utilities for ClipForge
 * Provides consistent time display across the application
 */

/**
 * Format time with optional centiseconds (hundredths of a second)
 * Example: 65.5 seconds -> "1:05.50" (with centiseconds) or "1:05" (without)
 */
export const formatTime = (seconds: number, showCentiseconds: boolean = true): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  if (showCentiseconds) {
    const centiseconds = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  } else {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
};

/**
 * Format time with frames (useful for video editing at specific frame rates)
 * Example: 65.5 seconds at 30fps -> "1:05:15"
 */
export const formatTimeWithFrames = (seconds: number, fps: number = 30): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);
  return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
};

/**
 * Format time in simple MM:SS format (no fractional seconds)
 * Example: 65.5 seconds -> "1:05"
 */
export const formatTimeSimple = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format time for file names (no colons, suitable for filenames)
 * Example: 65.5 seconds -> "1m05s"
 */
export const formatTimeForFilename = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m${secs.toString().padStart(2, '0')}s`;
};

