import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { metadataService } from '../services/MetadataService';
import { ffmpegService } from '../services/FFmpegService';
import { Logger } from '../utils/logger';
import fs from 'fs';

const logger = new Logger('VideoHandlers');

export function registerVideoHandlers() {
  ipcMain.handle(IPC_CHANNELS.VIDEO_METADATA, async (_event, filePath: string) => {
    try {
      logger.info('Getting metadata for:', filePath);
      const metadata = await metadataService.getVideoMetadata(filePath);
      return { success: true, data: metadata };
    } catch (error: any) {
      logger.error('Failed to get metadata:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.VIDEO_THUMBNAIL, async (_event, filePath: string, timestamp: number = 0) => {
    try {
      logger.info('Extracting thumbnail for:', filePath, 'at', timestamp);
      const thumbnailPath = await ffmpegService.extractThumbnail(filePath, timestamp);
      
      // Read the thumbnail as base64 for easy transmission
      const thumbnailData = fs.readFileSync(thumbnailPath, { encoding: 'base64' });
      const dataUrl = `data:image/jpeg;base64,${thumbnailData}`;
      
      // Clean up temp file
      fs.unlinkSync(thumbnailPath);
      
      return { success: true, data: dataUrl };
    } catch (error: any) {
      logger.error('Failed to extract thumbnail:', error);
      return { success: false, error: error.message };
    }
  });
}

