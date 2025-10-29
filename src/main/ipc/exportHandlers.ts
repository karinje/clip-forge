import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { ffmpegService } from '../services/FFmpegService';
import { metadataService } from '../services/MetadataService';
import { Logger } from '../utils/logger';

const logger = new Logger('ExportHandlers');

export function registerExportHandlers() {
  // Single clip export with trim
  ipcMain.handle(IPC_CHANNELS.VIDEO_EXPORT, async (_event, options) => {
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
        format,
        quality,
        onProgress: (percent) => {
          logger.info(`Export progress: ${percent.toFixed(2)}%`);
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
  ipcMain.handle(IPC_CHANNELS.VIDEO_EXPORT_MULTIPLE, async (_event, options) => {
    try {
      const { clips, outputPath, format, quality } = options;
      
      logger.info('Exporting multiple clips:', { clipCount: clips.length, outputPath });
      
      // For MVP, we'll just export the first clip
      // Full multi-clip concatenation will be implemented later
      if (clips.length === 1) {
        const clip = clips[0];
        
        await ffmpegService.exportVideo({
          inputPath: clip.filePath,
          outputPath,
          trimStart: clip.trimStart,
          trimEnd: clip.trimEnd,
          format,
          quality,
        });
      } else {
        // TODO: Implement proper concatenation with trims
        throw new Error('Multi-clip export not yet implemented. Please export one clip at a time.');
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
}


