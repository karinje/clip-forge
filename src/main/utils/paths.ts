import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export function getFFmpegPath(): string {
  // Always use @ffmpeg-installer/ffmpeg for now
  // This works in both dev and when running via npm start
  // When we package with electron-builder, we'll need to bundle the binary
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  return ffmpegInstaller.path;
}

export function getTempDir(): string {
  const tempPath = path.join(app.getPath('temp'), 'clipforge');
  
  // Ensure temp directory exists
  if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath, { recursive: true });
  }
  
  return tempPath;
}

export function getUserDataPath(): string {
  return app.getPath('userData');
}

