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
    audioOnly?: boolean;
    volume?: number;
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
      audioOnly?: boolean;
      volume?: number;
    }>;
    type: 'main' | 'overlay';
    muted: boolean;
    volume?: number;
  }>;
  outputPath: string;
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  durationMode?: 'main' | 'shortest' | 'longest';
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
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-y', // Force overwrite existing files
          '-preset medium',
          '-crf 23',
        ])
        .output(outputPath)
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
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-y', // Force overwrite existing files
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
        .outputOptions(['-y']) // Force overwrite existing files
        .output(outputPath)
        .on('start', (commandLine) => {
          logger.info('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', () => {
          logger.info('✅ Export complete:', outputPath);
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          logger.error('❌ Export failed:', err);
          logger.error('FFmpeg stderr:', stderr);
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
        .outputOptions(['-y']) // Force overwrite existing files
        .output(outputPath)
        .on('start', (commandLine) => {
          logger.info('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent);
          }
        })
        .on('end', () => {
          logger.info('✅ Multi-clip export complete:', outputPath);
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          logger.error('❌ Multi-clip export failed:', err);
          logger.error('FFmpeg stderr:', stderr);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Export multi-track timeline with picture-in-picture overlay
   */
  async exportMultiTrack(options: ExportMultiTrackOptions): Promise<void> {
    const { tracks, outputPath, format, quality, durationMode = 'main', pipConfig, onProgress } = options;
    
    logger.info('Exporting multi-track timeline:', { trackCount: tracks.length, durationMode });

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
        .then(async (paths) => {
          trackPaths.push(...paths);
          
          // Calculate duration of each track
          const trackDurations = tracks.map(track => 
            track.clips.reduce((sum, clip) => sum + clip.duration, 0)
          );
          
          logger.info('Track durations:', trackDurations);
          
          // Determine target duration based on mode
          let targetDuration: number | undefined;
          if (durationMode === 'main') {
            targetDuration = trackDurations[0];
            logger.info('Using main track duration:', targetDuration);
          } else if (durationMode === 'shortest') {
            targetDuration = Math.min(...trackDurations);
            logger.info('Using shortest track duration:', targetDuration);
          } else {
            // 'longest' mode - no target, let FFmpeg handle with shortest=0
            targetDuration = undefined;
            logger.info('Using longest track duration (no limit)');
          }
          
          // Step 2: Composite tracks with PiP
          const mainTrack = trackPaths[0];
          const overlayTracks = trackPaths.slice(1);
          
          // Probe each file to check if it has a video stream
          const checkHasVideo = async (filePath: string): Promise<boolean> => {
            return new Promise((resolve) => {
              ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err || !metadata.streams) {
                  resolve(false);
                  return;
                }
                const hasVideo = metadata.streams.some(s => s.codec_type === 'video');
                resolve(hasVideo);
              });
            });
          };
          
          // Check all tracks for video streams
          const hasVideoArray = await Promise.all(trackPaths.map(p => checkHasVideo(p)));
          logger.info('Video stream availability per track:', hasVideoArray);
          
          // Determine which overlay tracks are audio-only (no video stream OR audioOnly flag set)
          const overlayTrackConfigs = tracks.slice(1).map((track, idx) => {
            const trackIndex = idx + 1; // +1 because we sliced off the main track
            const hasVideoStream = hasVideoArray[trackIndex];
            const markedAudioOnly = track.clips.length > 0 && track.clips.every(clip => clip.audioOnly === true);
            
            return {
              isAudioOnly: !hasVideoStream || markedAudioOnly,
              index: tracks.indexOf(track),
              hasVideoStream,
              markedAudioOnly
            };
          });
          
          logger.info('Overlay track configurations:', overlayTrackConfigs);
          
          // Filter to get only video overlays (has video stream AND not marked audio-only)
          const videoOverlayIndices = overlayTrackConfigs
            .filter(cfg => !cfg.isAudioOnly)
            .map(cfg => cfg.index - 1); // Adjust index for overlay array
          
          logger.info('Video overlay indices:', videoOverlayIndices);
          
          if (overlayTracks.length === 0) {
            // No overlay tracks at all, just copy the main track
            const command = ffmpeg(mainTrack)
              .outputOptions([
                '-y', // Force overwrite existing files
                '-c:v copy',
                '-c:a copy',
                '-map 0:v',
                '-map 0:a?'
              ]);
            
            // Apply target duration if set (though this shouldn't matter for single track)
            if (targetDuration !== undefined) {
              command.outputOptions(['-t', targetDuration.toString()]);
            }
            
            command
              .output(outputPath)
              .on('end', () => {
                logger.info('Multi-track export complete (no overlay)');
                resolve();
              })
              .on('error', reject)
              .run();
            return;
          }
          
          if (videoOverlayIndices.length === 0) {
            // All overlays are audio-only, just use main video and mix audio
            logger.info('All overlay tracks are audio-only, mixing audio only');
            
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
                logger.info('Audio availability per track:', hasAudioArray);
                
                const command = ffmpeg();
                command.input(mainTrack);
                overlayTracks.forEach(track => command.input(track));
                
                // Use main video
                command.outputOptions(['-map', '0:v']);
                
                // Mix audio only from tracks that have it and aren't muted
                const audioFilters: string[] = [];
                const audioInputs: string[] = [];
                
                tracks.forEach((track, i) => {
                  if (!track.muted && hasAudioArray[i]) {
                    const trackVolume = track.volume ?? 100;
                    const volumeMultiplier = trackVolume / 100;
                    
                    if (volumeMultiplier !== 1.0) {
                      audioFilters.push(`[${i}:a]volume=${volumeMultiplier}[a${i}]`);
                      audioInputs.push(`[a${i}]`);
                    } else {
                      audioInputs.push(`[${i}:a]`);
                    }
                  }
                });
                
                logger.info('Audio inputs for mixing:', audioInputs);
                
                if (audioInputs.length > 1) {
                  // Multiple audio tracks - mix them
                  // Use 'first' duration mode for main/shortest, 'longest' for longest mode
                  const mixDuration = durationMode === 'longest' ? 'longest' : 'first';
                  audioFilters.push(`${audioInputs.join('')}amix=inputs=${audioInputs.length}:duration=${mixDuration}[outa]`);
                  command.complexFilter(audioFilters);
                  command.outputOptions(['-map', '[outa]']);
                } else if (audioInputs.length === 1) {
                  // Single audio track
                  if (audioFilters.length > 0) {
                    command.complexFilter(audioFilters);
                    command.outputOptions(['-map', audioInputs[0]]);
                  } else {
                    const audioIndex = tracks.findIndex((track, i) => !track.muted && hasAudioArray[i]);
                    command.outputOptions(['-map', `${audioIndex}:a?`]);
                  }
                }
                // If no audio tracks, video-only export
                
                command
                  .videoCodec('copy')
                  .audioCodec('aac')
                  .outputOptions([
                    '-y', // Force overwrite existing files
                    '-preset medium'
                  ]);
                
                // Apply target duration if set (for main/shortest modes)
                if (targetDuration !== undefined) {
                  command.outputOptions(['-t', targetDuration.toString()]);
                }
                
                command
                  .output(outputPath)
                  .on('end', () => {
                    logger.info('Audio-only overlay export complete');
                    resolve();
                  })
                  .on('error', reject)
                  .run();
              })
              .catch(reject);
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
          
          // Build filter: scale overlay and composite (only for video tracks)
          const filters: string[] = [];
          
          // Scale each VIDEO overlay (skip audio-only tracks)
          videoOverlayIndices.forEach((overlayIdx, pipIdx) => {
            filters.push(`[${overlayIdx + 1}:v]scale=iw*${scale}:ih*${scale},setpts=PTS-STARTPTS[pip${pipIdx}]`);
          });
          
          // Overlay each video onto the main (chain them)
          // shortest=1 means end when shortest input ends, shortest=0 means extend to longest
          const shortestParam = durationMode === 'longest' ? 0 : 1;
          let currentInput = '[0:v]';
          videoOverlayIndices.forEach((_, pipIdx) => {
            if (pipIdx === videoOverlayIndices.length - 1) {
              filters.push(`${currentInput}[pip${pipIdx}]overlay=${position}:shortest=${shortestParam}[outv]`);
            } else {
              filters.push(`${currentInput}[pip${pipIdx}]overlay=${position}:shortest=${shortestParam}[tmp${pipIdx}]`);
              currentInput = `[tmp${pipIdx}]`;
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
              // Apply volume adjustments as well
              const audioFilters: string[] = [...filters];
              const audioInputs: string[] = [];
              
              tracks.forEach((track, i) => {
                if (!track.muted && hasAudioArray[i]) {
                  const trackVolume = track.volume ?? 100;
                  const volumeMultiplier = trackVolume / 100; // Convert percentage to multiplier
                  
                  if (volumeMultiplier !== 1.0) {
                    // Apply volume filter
                    audioFilters.push(`[${i}:a]volume=${volumeMultiplier}[a${i}]`);
                    audioInputs.push(`[a${i}]`);
                  } else {
                    audioInputs.push(`[${i}:a]`);
                  }
                }
              });
              
              if (audioInputs.length > 1) {
                // Multiple audio tracks - mix them
                // Use 'first' duration mode for main/shortest, 'longest' for longest mode
                const mixDuration = durationMode === 'longest' ? 'longest' : 'first';
                audioFilters.push(`${audioInputs.join('')}amix=inputs=${audioInputs.length}:duration=${mixDuration}[outa]`);
                command.complexFilter(audioFilters);
                command.outputOptions(['-map', '[outa]']);
              } else if (audioInputs.length === 1) {
                // Single audio track - use it with volume adjustment if needed
                if (audioFilters.length > filters.length) {
                  // Volume filter was applied
                  command.complexFilter(audioFilters);
                  command.outputOptions(['-map', audioInputs[0]]);
                } else {
                  // No volume adjustment, use direct mapping
                  const audioIndex = tracks.findIndex((track, i) => !track.muted && hasAudioArray[i]);
                  command.outputOptions(['-map', `${audioIndex}:a?`]);
                }
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
                  '-y', // Force overwrite existing files
                ]);
              
              // Apply target duration if set (for main/shortest modes)
              if (targetDuration !== undefined) {
                command.outputOptions(['-t', targetDuration.toString()]);
              }
              
              command
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

