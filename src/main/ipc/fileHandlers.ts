import { dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { Logger } from '../utils/logger';

const logger = new Logger('FileHandlers');

export function registerFileHandlers() {
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async () => {
    logger.info('Opening file dialog');
    
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'mov', 'webm', 'avi', 'mkv', 'mp3', 'wav', 'aac', 'm4a'] },
        { name: 'Videos', extensions: ['mp4', 'mov', 'webm', 'avi', 'mkv'] },
        { name: 'Audio', extensions: ['mp3', 'wav', 'aac', 'm4a'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled) {
      logger.info('File dialog canceled');
      return { success: true, data: [] };
    }

    logger.info('Files selected:', result.filePaths);
    return { success: true, data: result.filePaths };
  });

  ipcMain.handle(IPC_CHANNELS.FILE_SAVE, async (_event, defaultPath?: string) => {
    logger.info('Opening save dialog');
    
    const result = await dialog.showSaveDialog({
      defaultPath: defaultPath || 'output.mp4',
      filters: [
        { name: 'MP4 Video', extensions: ['mp4'] },
        { name: 'WebM Video', extensions: ['webm'] },
        { name: 'MOV Video', extensions: ['mov'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      logger.info('Save dialog canceled');
      return null;
    }

    logger.info('Save path selected:', result.filePath);
    return result.filePath;
  });

  ipcMain.handle(IPC_CHANNELS.FILE_DELETE, async (_event, filePath: string) => {
    logger.info('Deleting file:', filePath);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('File deleted successfully:', filePath);
        return { success: true };
      } else {
        logger.warn('File does not exist:', filePath);
        return { success: true }; // Not an error if file doesn't exist
      }
    } catch (error) {
      logger.error('Failed to delete file:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_COPY, async (_event, sourcePath: string, destPath: string) => {
    logger.info('Copying file:', { sourcePath, destPath });
    
    try {
      fs.copyFileSync(sourcePath, destPath);
      logger.info('File copied successfully');
      return { success: true };
    } catch (error) {
      logger.error('Failed to copy file:', error);
      return { success: false, error: (error as Error).message };
    }
  });
}

