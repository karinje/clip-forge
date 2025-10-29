import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants/channels';

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),
  saveFile: (defaultPath?: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, defaultPath),
  
  // Video operations
  getVideoMetadata: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_METADATA, filePath),
  getVideoThumbnail: (filePath: string, timestamp?: number) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_THUMBNAIL, filePath, timestamp),
  exportVideo: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_EXPORT, options),
  exportMultipleClips: (options: any) => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_EXPORT_MULTIPLE, options),
  
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
  saveFile: (defaultPath?: string) => Promise<string | null>;
  getVideoMetadata: (filePath: string) => Promise<any>;
  getVideoThumbnail: (filePath: string, timestamp?: number) => Promise<{ success: boolean; data?: string; error?: string }>;
  exportVideo: (options: any) => Promise<{ success: boolean; outputPath?: string; error?: string }>;
  exportMultipleClips: (options: any) => Promise<{ success: boolean; outputPath?: string; error?: string }>;
  sendMessage: (channel: string, data: any) => void;
  onMessage: (channel: string, callback: (...args: any[]) => void) => void;
  invoke: (channel: string, ...args: any[]) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

