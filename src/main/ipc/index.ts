import { registerFileHandlers } from './fileHandlers';
import { registerVideoHandlers } from './videoHandlers';
import { registerExportHandlers } from './exportHandlers';
import { registerRecordingHandlers } from './recordingHandlers';

export function registerAllHandlers() {
  registerFileHandlers();
  registerVideoHandlers();
  registerExportHandlers();
  registerRecordingHandlers();
}

