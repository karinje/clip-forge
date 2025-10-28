import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/channels';

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),
  saveFile: (defaultPath?: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, defaultPath),
  
  // Video operations
  getVideoMetadata: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_METADATA, filePath),
  
  // Generic IPC (for future use)
  sendMessage: (channel: string, data: any) => {
    ipcRenderer.send(channel, data);
  },
  onMessage: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => callback(...args));
  },
  invoke: (channel: string, ...args: any[]) => {
    return ipcRenderer.invoke(channel, ...args);
  },
});

// Type definitions for window.electronAPI
export interface ElectronAPI {
  openFile: () => Promise<{ success: boolean; data: string[] }>;
  saveFile: (defaultPath?: string) => Promise<{ success: boolean; data: string | null }>;
  getVideoMetadata: (filePath: string) => Promise<any>;
  sendMessage: (channel: string, data: any) => void;
  onMessage: (channel: string, callback: (...args: any[]) => void) => void;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

