import { registerFileHandlers } from './fileHandlers';
import { registerVideoHandlers } from './videoHandlers';
import { registerExportHandlers } from './exportHandlers';

export function registerAllHandlers() {
  registerFileHandlers();
  registerVideoHandlers();
  registerExportHandlers();
}

