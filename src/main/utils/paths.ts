import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export function getFFmpegPath(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  let ffmpegPath = ffmpegInstaller.path;
  
  // When packaged with electron-builder, FFmpeg is unpacked from asar
  // The path will be in app.asar.unpacked instead of app.asar
  if (ffmpegPath.includes('app.asar')) {
    ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
  }
  
  return ffmpegPath;
}

export function getFFprobePath(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
  let ffprobePath = ffprobeInstaller.path;
  
  // When packaged with electron-builder, FFprobe is unpacked from asar
  if (ffprobePath.includes('app.asar')) {
    ffprobePath = ffprobePath.replace('app.asar', 'app.asar.unpacked');
  }
  
  return ffprobePath;
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

