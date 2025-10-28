import { app, BrowserWindow } from 'electron';
import { createWindow } from './window';
import { ffmpegService } from './services/FFmpegService';
import { registerAllHandlers } from './ipc';
import { Logger } from './utils/logger';

const logger = new Logger('Main');
let mainWindow: BrowserWindow | null = null;

app.on('ready', async () => {
  // Register IPC handlers
  registerAllHandlers();

  // Test FFmpeg installation
  const ffmpegWorking = await ffmpegService.testInstallation();
  if (ffmpegWorking) {
    logger.info('✓ FFmpeg is working correctly');
  } else {
    logger.error('✗ FFmpeg test failed - video processing may not work');
  }

  mainWindow = createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createWindow();
  }
});

