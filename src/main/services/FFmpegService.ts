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
}

export const ffmpegService = new FFmpegService();

