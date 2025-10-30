import { ipcMain, desktopCapturer } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { Logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

const logger = new Logger('RecordingHandlers');

export function registerRecordingHandlers() {
  // Get available recording sources (screens and windows)
  ipcMain.handle(IPC_CHANNELS.RECORDING_GET_SOURCES, async () => {
    try {
      logger.info('Getting recording sources...');
      
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 300, height: 200 },
      });
      
      logger.info(`Found ${sources.length} sources`);
      
      return sources.map(source => ({
        id: source.id,
        name: source.name,
        thumbnail: source.thumbnail.toDataURL(),
        type: source.id.startsWith('screen') ? 'screen' : 'window',
      }));
    } catch (error: any) {
      logger.error('Failed to get recording sources:', error);
      return [];
    }
  });
  
  // Save recording file
  ipcMain.handle(IPC_CHANNELS.RECORDING_SAVE_FILE, async (event, arrayBuffer: ArrayBuffer, fileName: string) => {
    try {
      logger.info('Saving recording file:', fileName);
      
      // Save to user's Downloads folder (more reliable than Videos)
      const downloadsPath = app.getPath('downloads');
      const clipforgeDir = path.join(downloadsPath, 'ClipForge');
      const outputPath = path.join(clipforgeDir, fileName);
      
      // Create directory if it doesn't exist
      await fs.mkdir(clipforgeDir, { recursive: true });
      
      // Write file from ArrayBuffer
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(outputPath, buffer);
      
      logger.info('Recording saved:', outputPath);
      
      return {
        success: true,
        filePath: outputPath,
      };
    } catch (error: any) {
      logger.error('Failed to save recording:', error);
      return {
        success: false,
        error: error.message || 'Failed to save recording',
      };
    }
  });
}

