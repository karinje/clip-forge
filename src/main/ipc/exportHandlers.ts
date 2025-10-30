import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { ffmpegService } from '../services/FFmpegService';
import { metadataService } from '../services/MetadataService';
import { Logger } from '../utils/logger';

const logger = new Logger('ExportHandlers');

export function registerExportHandlers() {
  // Single clip export with trim
  ipcMain.handle(IPC_CHANNELS.VIDEO_EXPORT, async (event, options) => {
    try {
      const { inputPath, outputPath, trimStart, trimEnd, format, quality } = options;
      
      logger.info('Exporting single clip:', { inputPath, outputPath, format, quality });
      
      // Get video metadata to calculate actual duration
      const metadata = await metadataService.getVideoMetadata(inputPath);
      const originalDuration = metadata.duration;
      
      // Calculate the actual duration after trim
      const actualTrimStart = trimStart || 0;
      const actualTrimEnd = trimEnd || 0;
      const exportDuration = originalDuration - actualTrimStart - actualTrimEnd;
      
      logger.info('Export duration:', { originalDuration, actualTrimStart, actualTrimEnd, exportDuration });
      
      await ffmpegService.exportVideo({
        inputPath,
        outputPath,
        trimStart: actualTrimStart,
        trimEnd: actualTrimEnd,
        duration: exportDuration,
        format,
        quality,
        onProgress: (percent) => {
          logger.info(`Export progress: ${percent.toFixed(2)}%`);
          // Send progress update to renderer
          event.sender.send('export-progress', percent);
        },
      });
      
      logger.info('Export successful:', outputPath);
      
      return {
        success: true,
        outputPath,
      };
    } catch (error: any) {
      logger.error('Export failed:', error);
      return {
        success: false,
        error: error.message || 'Export failed',
      };
    }
  });
  
  // Multiple clips export (concatenate)
  ipcMain.handle(IPC_CHANNELS.VIDEO_EXPORT_MULTIPLE, async (event, options) => {
    try {
      const { clips, outputPath, format, quality } = options;
      
      logger.info('Exporting multiple clips:', { clipCount: clips.length, outputPath });
      
      if (clips.length === 1) {
        // Single clip - use direct export
        const clip = clips[0];
        
        // Get metadata to calculate duration
        const metadata = await metadataService.getVideoMetadata(clip.filePath);
        const clipDuration = metadata.duration - clip.trimStart - clip.trimEnd;
        
        await ffmpegService.exportVideo({
          inputPath: clip.filePath,
          outputPath,
          trimStart: clip.trimStart,
          trimEnd: clip.trimEnd,
          duration: clipDuration,
          format,
          quality,
          onProgress: (percent) => {
            logger.info(`Export progress: ${percent.toFixed(2)}%`);
            event.sender.send('export-progress', percent);
          },
        });
      } else {
        // Multiple clips - concatenate with trims
        logger.info('Concatenating multiple clips with trims');
        
        await ffmpegService.exportMultipleClips({
          clips: clips.map((clip: any) => ({
            filePath: clip.filePath,
            trimStart: clip.trimStart,
            trimEnd: clip.trimEnd,
            duration: clip.duration,
          })),
          outputPath,
          format,
          quality,
          onProgress: (percent) => {
            logger.info(`Export progress: ${percent.toFixed(2)}%`);
            event.sender.send('export-progress', percent);
          },
        });
      }
      
      logger.info('Multi-clip export successful:', outputPath);
      
      return {
        success: true,
        outputPath,
      };
    } catch (error: any) {
      logger.error('Multi-clip export failed:', error);
      return {
        success: false,
        error: error.message || 'Multi-clip export failed',
      };
    }
  });
  
  // Multi-track export (with picture-in-picture)
  ipcMain.handle(IPC_CHANNELS.VIDEO_EXPORT_MULTITRACK, async (event, options) => {
    try {
      const { tracks, outputPath, format, quality, pipConfig } = options;
      
      logger.info('Exporting multi-track timeline:', { trackCount: tracks.length, outputPath });
      
      await ffmpegService.exportMultiTrack({
        tracks: tracks.map((track: any) => ({
          clips: track.clips.map((clip: any) => ({
            filePath: clip.filePath,
            trimStart: clip.trimStart,
            trimEnd: clip.trimEnd,
            duration: clip.duration,
          })),
          type: track.type,
          muted: track.muted,
        })),
        outputPath,
        format,
        quality,
        pipConfig: pipConfig || { position: 'bottom-right', scale: 0.25 },
        onProgress: (percent) => {
          logger.info(`Multi-track export progress: ${percent.toFixed(2)}%`);
          event.sender.send('export-progress', percent);
        },
      });
      
      logger.info('Multi-track export successful:', outputPath);
      
      return {
        success: true,
        outputPath,
      };
    } catch (error: any) {
      logger.error('Multi-track export failed:', error);
      return {
        success: false,
        error: error.message || 'Multi-track export failed',
      };
    }
  });
}
