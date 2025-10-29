import ffmpeg from 'fluent-ffmpeg';
import { getFFmpegPath, getTempDir } from '../utils/paths';
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
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  onProgress?: (percent: number) => void;
}

export class FFmpegService {
  constructor() {
    const ffmpegPath = getFFmpegPath();
    logger.info('Setting FFmpeg path to:', ffmpegPath);
    ffmpeg.setFfmpegPath(ffmpegPath);
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
    const { inputPath, outputPath, trimStart, trimEnd, format, quality, onProgress } = options;
    
    logger.info('Exporting video:', { inputPath, outputPath, format, quality, trimStart, trimEnd });

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      // Apply trim if specified
      if (trimStart !== undefined && trimStart > 0) {
        command = command.setStartTime(trimStart);
      }
      
      if (trimEnd !== undefined && trimEnd > 0) {
        // trimEnd is seconds from the END of the video
        // We need to calculate duration based on original duration minus trimEnd
        // For now, we'll handle this in the IPC handler
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

