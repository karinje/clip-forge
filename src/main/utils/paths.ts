import path from 'path';
import { app } from 'electron';
import fs from 'fs';

export function getFFmpegPath(): string {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    // Development: use node_modules binary
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@ffmpeg-installer/ffmpeg').path;
  }

  // Production: use bundled binary
  const platform = process.platform;
  const arch = process.arch;
  const binaryName = platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

  return path.join(
    process.resourcesPath,
    'ffmpeg',
    `${platform}-${arch}`,
    binaryName
  );
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

