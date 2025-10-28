import { registerFileHandlers } from './fileHandlers';
import { registerVideoHandlers } from './videoHandlers';

export function registerAllHandlers() {
  registerFileHandlers();
  registerVideoHandlers();
}

