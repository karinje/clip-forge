import ffmpeg from 'fluent-ffmpeg';
import { getFFmpegPath, getFFprobePath, getTempDir } from '../utils/paths';
import { Logger } from '../utils/logger';
import path from 'path';

const logger = new Logger('FFmpegService');

export interface TrimOptions {
  inputPath: string;
  outputPath: string;
  trimStart: number;
  trimEnd: number;
  onProgress?: (percent: number) => void;
}

export interface ConcatenateOptions {
  inputPaths: string[];
  outputPath: string;
  onProgress?: (percent: number) => void;
}

export interface ExportOptions {
  inputPath: string;
  outputPath: string;
  trimStart?: number;
  trimEnd?: number;
  duration?: number;
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  onProgress?: (percent: number) => void;
}

export interface ExportMultipleClipsOptions {
  clips: Array<{
    filePath: string;
    trimStart: number;
    trimEnd: number;
    duration: number;
  }>;
  outputPath: string;
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  onProgress?: (percent: number) => void;
}

export interface ExportMultiTrackOptions {
  tracks: Array<{
    clips: Array<{
      filePath: string;
      trimStart: number;
      trimEnd: number;
      duration: number;
    }>;
    type: 'main' | 'overlay';
    muted: boolean;
  }>;
  outputPath: string;
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  pipConfig: {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    scale: number; // 0-1
  };
  onProgress?: (percent: number) => void;
}

export class FFmpegService {
  constructor() {
    const ffmpegPath = getFFmpegPath();
    const ffprobePath = getFFprobePath();
    logger.info('Setting FFmpeg path to:', ffmpegPath);
    logger.info('Setting FFprobe path to:', ffprobePath);
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
  }

  async testInstallation(): Promise<boolean> {
    logger.info('Testing FFmpeg installation...');
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
          logger.error('FFmpeg test failed:', err);
          resolve(false);
        } else {
          logger.info('FFmpeg is working, formats available:', Object.keys(formats || {}).length);
          resolve(true);
        }
      });
    });
  }

  async concatenateVideos(options: ConcatenateOptions): Promise<void> {
    const { inputPaths, outputPath, onProgress } = options;
    logger.info('Concatenating videos:', { inputCount: inputPaths.length, outputPath });

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      inputPaths.forEach((filePath) => command.input(filePath));

      const tempDir = getTempDir();

      command
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', () => {
          logger.info('Concatenation complete');
          resolve();
        })
        .on('error', (err) => {
          logger.error('Concatenation failed:', err);
          reject(err);
        })
        .mergeToFile(outputPath, tempDir);
    });
  }

  async trimVideo(options: TrimOptions): Promise<void> {
    const { inputPath, outputPath, trimStart, trimEnd, onProgress } = options;
    const duration = trimEnd - trimStart;

    logger.info('Trimming video:', { inputPath, trimStart, trimEnd, duration });

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(trimStart)
        .setDuration(duration)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset medium',
          '-crf 23',
        ])
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', () => {
          logger.info('Trim complete');
          resolve();
        })
        .on('error', (err) => {
          logger.error('Trim failed:', err);
          reject(err);
        })
        .run();
    });
  }

  async convertToMP4(
    inputPath: string,
    outputPath: string,
    onProgress?: (percent: number) => void
  ): Promise<void> {
    logger.info('Converting to MP4:', { inputPath, outputPath });

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset medium',
          '-crf 23',
          '-movflags +faststart',
        ])
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', () => {
          logger.info('Conversion complete');
          resolve();
        })
        .on('error', (err) => {
          logger.error('Conversion failed:', err);
          reject(err);
        })
        .run();
    });
  }

  async exportVideo(options: ExportOptions): Promise<void> {
    const { inputPath, outputPath, trimStart, trimEnd, duration, format, quality, onProgress } = options;
    
    logger.info('Exporting video:', { inputPath, outputPath, format, quality, trimStart, trimEnd, duration });

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Apply trim if specified
      const actualTrimStart = trimStart || 0;
      
      if (actualTrimStart > 0) {
        command = command.setStartTime(actualTrimStart);
      }
      
      // Set duration if specified (this handles the trimEnd by limiting output duration)
      if (duration !== undefined && duration > 0) {
        command = command.setDuration(duration);
      }

      // Quality settings
      const qualityMap = {
        high: { scale: '1920:1080', crf: '18' },
        medium: { scale: '1280:720', crf: '23' },
        low: { scale: '854:480', crf: '28' },
      };

      const qualitySettings = qualityMap[quality];

      // Format-specific encoding
      if (format === 'mp4') {
        command
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            `-vf scale=${qualitySettings.scale}:force_original_aspect_ratio=decrease`,
            '-preset medium',
            `-crf ${qualitySettings.crf}`,
            '-movflags +faststart',
          ]);
      } else if (format === 'webm') {
        command
          .videoCodec('libvpx-vp9')
          .audioCodec('libopus')
          .outputOptions([
            `-vf scale=${qualitySettings.scale}:force_original_aspect_ratio=decrease`,
            '-preset medium',
            `-crf ${qualitySettings.crf}`,
            '-b:v 0',
          ]);
      } else if (format === 'mov') {
        command
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            `-vf scale=${qualitySettings.scale}:force_original_aspect_ratio=decrease`,
            '-preset medium',
            `-crf ${qualitySettings.crf}`,
            '-pix_fmt yuv420p',
          ]);
      }

      command
        .output(outputPath)
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', () => {
          logger.info('Export complete');
          resolve();
        })
        .on('error', (err) => {
          logger.error('Export failed:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Export multiple clips with trims and concatenate them
   */
  async exportMultipleClips(options: ExportMultipleClipsOptions): Promise<void> {
    const { clips, outputPath, format, quality, onProgress } = options;
    
    logger.info('Exporting and concatenating multiple clips:', { clipCount: clips.length });

    return new Promise((resolve, reject) => {
      const command = ffmpeg();

      // Add each clip as input
      clips.forEach((clip) => {
        command.input(clip.filePath);
      });

      // Quality settings
      const qualityMap = {
        high: '1920:1080',
        medium: '1280:720',
        low: '854:480',
      };

      // Build filter: video only, then add audio if available
      const videoFilters = clips.map((clip, i) => {
        const trimStart = clip.trimStart || 0;
        const duration = clip.duration;
        return `[${i}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS,scale=${qualityMap[quality]}:force_original_aspect_ratio=decrease,pad=${qualityMap[quality]}:(ow-iw)/2:(oh-ih)/2,fps=30[v${i}]`;
      });

      // Concatenate videos
      const videoConcat = `${clips.map((_, i) => `[v${i}]`).join('')}concat=n=${clips.length}:v=1:a=0[outv]`;

      command.complexFilter([
        ...videoFilters,
        videoConcat,
      ]);

      // Map the output video stream
      command.outputOptions(['-map', '[outv]']);

      // Try to copy audio from first input if available
      command.outputOptions(['-map', '0:a?'])

      // Format-specific encoding
      if (format === 'mp4') {
        command
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset medium',
            '-crf 23',
            '-movflags +faststart',
            '-shortest', // Handle clips with different lengths
          ]);
      } else if (format === 'webm') {
        command
          .videoCodec('libvpx-vp9')
          .audioCodec('libopus')
          .outputOptions([
            '-preset medium',
            '-crf 23',
            '-b:v 0',
            '-shortest',
          ]);
      } else if (format === 'mov') {
        command
          .videoCodec('libx264')
          .audioCodec('aac')
          .outputOptions([
            '-preset medium',
            '-crf 23',
            '-pix_fmt yuv420p',
            '-shortest',
          ]);
      }

      command
        .output(outputPath)
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', () => {
          logger.info('Multi-clip export complete');
          resolve();
        })
        .on('error', (err) => {
          logger.error('Multi-clip export failed:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Export multi-track timeline with picture-in-picture overlay
   */
  async exportMultiTrack(options: ExportMultiTrackOptions): Promise<void> {
    const { tracks, outputPath, format, quality, pipConfig, onProgress } = options;
    
    logger.info('Exporting multi-track timeline:', { trackCount: tracks.length });

    return new Promise((resolve, reject) => {
      const tempDir = getTempDir();
      
      // Step 1: Concatenate each track separately
      const trackPaths: string[] = [];
      
      const concatenateTrack = async (track: typeof tracks[0], index: number): Promise<string> => {
        const trackOutputPath = path.join(tempDir, `track_${index}_${Date.now()}.mp4`);
        
        if (track.clips.length === 1) {
          // Single clip, just export with trim
          const clip = track.clips[0];
          await this.exportVideo({
            inputPath: clip.filePath,
            outputPath: trackOutputPath,
            trimStart: clip.trimStart,
            trimEnd: clip.trimEnd,
            duration: clip.duration,
            format: 'mp4',
            quality,
          });
        } else {
          // Multiple clips, concatenate
          await this.exportMultipleClips({
            clips: track.clips,
            outputPath: trackOutputPath,
            format: 'mp4',
            quality,
          });
        }
        
        return trackOutputPath;
      };
      
      // Concatenate all tracks sequentially
      Promise.all(tracks.map((track, i) => concatenateTrack(track, i)))
        .then((paths) => {
          trackPaths.push(...paths);
          
          // Step 2: Composite tracks with PiP
          const mainTrack = trackPaths[0];
          const overlayTracks = trackPaths.slice(1);
          
          if (overlayTracks.length === 0) {
            // No overlay, just copy the main track
            // Use stream copy for both video and audio (if it exists)
            ffmpeg(mainTrack)
              .output(outputPath)
              .outputOptions([
                '-c:v copy',  // Copy video codec
                '-c:a copy',  // Copy audio codec if present
                '-map 0:v',   // Map video
                '-map 0:a?'   // Map audio only if it exists (? makes it optional)
              ])
              .on('end', () => {
                logger.info('Multi-track export complete (no overlay)');
                resolve();
              })
              .on('error', reject)
              .run();
            return;
          }
          
          // Build overlay filter
          const command = ffmpeg();
          command.input(mainTrack);
          overlayTracks.forEach(track => command.input(track));
          
          // Position calculation
          const positionMap = {
            'top-left': '10:10',
            'top-right': 'W-w-10:10',
            'bottom-left': '10:H-h-10',
            'bottom-right': 'W-w-10:H-h-10',
          };
          
          const position = positionMap[pipConfig.position];
          const scale = pipConfig.scale;
          
          // Build filter: scale overlay and composite
          const filters: string[] = [];
          
          // Scale each overlay and add freeze on last frame (shortest=0 will extend shorter videos)
          overlayTracks.forEach((_, i) => {
            filters.push(`[${i + 1}:v]scale=iw*${scale}:ih*${scale},setpts=PTS-STARTPTS[pip${i}]`);
          });
          
          // Overlay each onto the main (chain them)
          // Use shortest=0 to extend all videos to the longest duration
          let currentInput = '[0:v]';
          overlayTracks.forEach((_, i) => {
            if (i === overlayTracks.length - 1) {
              filters.push(`${currentInput}[pip${i}]overlay=${position}:shortest=0[outv]`);
            } else {
              filters.push(`${currentInput}[pip${i}]overlay=${position}:shortest=0[tmp${i}]`);
              currentInput = `[tmp${i}]`;
            }
          });
          
          // Check which tracks have audio by probing the files
          const checkAudio = async (filePath: string): Promise<boolean> => {
            return new Promise((resolve) => {
              ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err || !metadata.streams) {
                  resolve(false);
                  return;
                }
                const hasAudio = metadata.streams.some(s => s.codec_type === 'audio');
                resolve(hasAudio);
              });
            });
          };
          
          // Check all tracks for audio
          Promise.all(trackPaths.map(p => checkAudio(p)))
            .then((hasAudioArray) => {
              // Build filter for video
              command.complexFilter(filters);
              command.outputOptions(['-map', '[outv]']);
              
              // Mix audio only from tracks that have it and aren't muted
              const audioInputs: string[] = [];
              tracks.forEach((track, i) => {
                if (!track.muted && hasAudioArray[i]) {
                  audioInputs.push(`[${i}:a]`);
                }
              });
              
              if (audioInputs.length > 1) {
                // Multiple audio tracks - mix them
                command.complexFilter([
                  ...filters,
                  `${audioInputs.join('')}amix=inputs=${audioInputs.length}:duration=longest[outa]`
                ]);
                command.outputOptions(['-map', '[outa]']);
              } else if (audioInputs.length === 1) {
                // Single audio track - use it directly
                const audioIndex = tracks.findIndex((track, i) => !track.muted && hasAudioArray[i]);
                command.outputOptions(['-map', `${audioIndex}:a?`]);
              }
              // If no audio tracks, video-only export (no audio mapping needed)
              
              // Quality settings
              command.videoCodec('libx264');
              
              // Only set audio codec if we have audio
              if (audioInputs.length > 0) {
                command.audioCodec('aac');
              }
              
              command
                .outputOptions([
                  '-preset medium',
                  '-crf 23',
                  '-movflags +faststart',
                ])
                .output(outputPath)
                .on('progress', (progress) => {
                  if (onProgress && progress.percent) {
                    onProgress(progress.percent);
                  }
                })
                .on('end', () => {
                  logger.info('Multi-track export complete');
                  resolve();
                })
                .on('error', (err) => {
                  logger.error('Multi-track export failed:', err);
                  reject(err);
                })
                .run();
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  /**
   * Extract a thumbnail from a video at a specific timestamp
   */
  async extractThumbnail(videoPath: string, timestamp: number = 0): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempDir = getTempDir();
      const outputPath = path.join(tempDir, `thumb_${Date.now()}.jpg`);
      
      ffmpeg(videoPath)
        .seekInput(timestamp)
        .frames(1)
        .output(outputPath)
        .on('end', () => {
          logger.info('Thumbnail extracted:', outputPath);
          resolve(outputPath);
        })
        .on('error', (err) => {
          logger.error('Thumbnail extraction failed:', err);
          reject(err);
        })
        .run();
    });
  }
}

export const ffmpegService = new FFmpegService();

