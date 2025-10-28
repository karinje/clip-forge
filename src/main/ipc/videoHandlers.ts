import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { metadataService } from '../services/MetadataService';
import { Logger } from '../utils/logger';

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
}

