import { dialog, ipcMain } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants/channels';
import { Logger } from '../utils/logger';

const logger = new Logger('FileHandlers');

export function registerFileHandlers() {
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async () => {
    logger.info('Opening file dialog');
    
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Videos', extensions: ['mp4', 'mov', 'webm', 'avi', 'mkv'] },
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
      defaultPath,
      filters: [
        { name: 'MP4 Video', extensions: ['mp4'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      logger.info('Save dialog canceled');
      return { success: false, data: null };
    }

    logger.info('Save path selected:', result.filePath);
    return { success: true, data: result.filePath };
  });
}

