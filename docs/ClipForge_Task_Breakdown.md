# ClipForge - Development Task Breakdown

**Goal**: Build desktop video editor in 72 hours with MVP submission Tuesday 10:59 PM CT, Full submission Wednesday 10:59 PM CT

**Philosophy**: Each PR should be independently testable and incrementally add value. PRs are sequenced to complete MVP requirements first, with logical extensions bundled where they don't risk MVP timeline.

**📋 File Reference**: See [`ClipForge_File_Mapping.md`](./ClipForge_File_Mapping.md) for a complete listing of which files to create/update for each PR.

---

## 🎯 Current Progress

### ✅ Completed PRs
- **PR-00**: Project Bootstrap & Environment Setup ✅
- **PR-01**: FFmpeg Integration & Build Configuration ✅
- **PR-02**: Video Import System ✅
- **PR-03**: Video Preview Player ✅
- **PR-04**: Basic Timeline UI & Single-Clip Display ✅ (2025-10-29)
- **PR-05**: Trim Functionality (In-Out Points) ✅ (2025-10-29)
- **PR-06**: Single-Clip & Multi-Clip Export with FFmpeg ✅ (2025-10-29)
- **PR-07**: Production Build & MVP Polish ✅ (2025-10-29)

### 🎉 MVP COMPLETE - READY FOR SUBMISSION!
- All MVP features implemented and tested ✅
- Production build working ✅
- Packaged DMG created: `out/ClipForge-1.0.0-arm64.dmg` ✅

**What's Working Now:**
- ✅ Electron app launches with React UI
- ✅ Video import via file picker and drag-and-drop
- ✅ FFmpeg metadata extraction (duration, resolution, format, codec, fps)
- ✅ Media library with clip management
- ✅ Video preview player with playback controls
- ✅ Play/pause, seek, and timeline scrubbing
- ✅ Zustand state management for clips and selection
- ✅ Timeline trimming keeps preview scrubber aligned with combined clip timing
- ✅ Single-clip export with trim support
- ✅ Multi-clip export with concatenation and audio handling
- ✅ Real-time export progress feedback
- ✅ Modern, professional dark-themed UI
- ✅ Production build configuration (no DevTools/console logs)
- ✅ Export success/error notifications

**Technical Achievements:**
- ✅ Webpack configured for main, preload, and renderer processes
- ✅ CSS modules working properly with `esModule: false`
- ✅ IPC communication between main and renderer
- ✅ FFmpeg binaries bundled via `@ffmpeg-installer/ffmpeg`
- ✅ TypeScript compilation without errors

---

## Complete Project File Structure

```
clipforge/
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.main.json
├── tsconfig.renderer.json
├── .gitignore
├── .eslintrc.js
├── README.md
├── forge.config.js                    # Electron Forge configuration
├── webpack.config.js                  # Webpack configuration for bundling
│
├── src/
│   ├── main/                          # Electron Main Process
│   │   ├── index.ts                   # Main entry point
│   │   ├── window.ts                  # Window management
│   │   ├── ipc/                       # IPC handlers
│   │   │   ├── index.ts
│   │   │   ├── fileHandlers.ts        # File import/export handlers
│   │   │   ├── videoHandlers.ts       # Video metadata handlers
│   │   │   ├── exportHandlers.ts      # Export handlers
│   │   │   └── recordingHandlers.ts   # Recording handlers
│   │   ├── services/                  # Business logic services
│   │   │   ├── FFmpegService.ts       # FFmpeg integration
│   │   │   ├── ExportService.ts       # Video export logic
│   │   │   ├── MetadataService.ts     # Video metadata extraction
│   │   │   └── RecordingService.ts    # Recording management
│   │   └── utils/                     # Utility functions
│   │       ├── paths.ts               # Path resolution helpers
│   │       └── logger.ts              # Logging utility
│   │
│   ├── renderer/                      # React Frontend
│   │   ├── index.tsx                  # Renderer entry point
│   │   ├── App.tsx                    # Root component
│   │   ├── index.html                 # HTML template
│   │   ├── styles/                    # Global styles
│   │   │   ├── index.css
│   │   │   ├── theme.ts               # Theme configuration
│   │   │   └── variables.css          # CSS variables
│   │   │
│   │   ├── components/                # React components
│   │   │   ├── MediaLibrary/
│   │   │   │   ├── MediaLibrary.tsx
│   │   │   │   ├── MediaLibrary.module.css
│   │   │   │   ├── MediaClipItem.tsx
│   │   │   │   └── MediaClipItem.module.css
│   │   │   │
│   │   │   ├── PreviewPlayer/
│   │   │   │   ├── PreviewPlayer.tsx
│   │   │   │   ├── PreviewPlayer.module.css
│   │   │   │   ├── PlaybackControls.tsx
│   │   │   │   └── PlaybackControls.module.css
│   │   │   │
│   │   │   ├── Timeline/
│   │   │   │   ├── Timeline.tsx
│   │   │   │   ├── Timeline.module.css
│   │   │   │   ├── TimelineRuler.tsx
│   │   │   │   ├── TimelineTrack.tsx
│   │   │   │   ├── TimelineClip.tsx
│   │   │   │   ├── TimelineClip.module.css
│   │   │   │   ├── Playhead.tsx
│   │   │   │   └── TrimHandles.tsx
│   │   │   │
│   │   │   ├── ExportDialog/
│   │   │   │   ├── ExportDialog.tsx
│   │   │   │   ├── ExportDialog.module.css
│   │   │   │   ├── ExportProgress.tsx
│   │   │   │   └── ExportSettings.tsx
│   │   │   │
│   │   │   ├── RecordingPanel/
│   │   │   │   ├── RecordingPanel.tsx
│   │   │   │   ├── RecordingPanel.module.css
│   │   │   │   ├── SourceSelector.tsx
│   │   │   │   ├── RecordingControls.tsx
│   │   │   │   ├── ScreenRecorder.tsx
│   │   │   │   └── WebcamRecorder.tsx
│   │   │   │
│   │   │   ├── Layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── AppLayout.module.css
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   ├── StatusBar.tsx
│   │   │   │   └── MenuBar.tsx
│   │   │   │
│   │   │   └── common/                # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Button.module.css
│   │   │       ├── Modal.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       ├── Tooltip.tsx
│   │   │       └── Toast.tsx
│   │   │
│   │   ├── store/                     # State management
│   │   │   ├── projectStore.ts        # Main project state (Zustand)
│   │   │   ├── timelineStore.ts       # Timeline-specific state
│   │   │   ├── recordingStore.ts      # Recording state
│   │   │   └── uiStore.ts             # UI state (modals, etc.)
│   │   │
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useMediaImport.ts
│   │   │   ├── useVideoPlayer.ts
│   │   │   ├── useTimeline.ts
│   │   │   ├── useExport.ts
│   │   │   ├── useRecording.ts
│   │   │   └── useKeyboardShortcuts.ts
│   │   │
│   │   ├── utils/                     # Renderer utilities
│   │   │   ├── timeFormatters.ts      # Time formatting helpers
│   │   │   ├── fileValidation.ts      # File validation
│   │   │   └── ipcRenderer.ts         # IPC wrapper functions
│   │   │
│   │   └── types/                     # TypeScript type definitions
│   │       ├── project.types.ts
│   │       ├── timeline.types.ts
│   │       ├── media.types.ts
│   │       └── export.types.ts
│   │
│   ├── preload/                       # Preload scripts
│   │   └── index.ts                   # Exposes IPC to renderer safely
│   │
│   └── shared/                        # Shared between main & renderer
│       ├── types/                     # Shared TypeScript types
│       │   ├── ipc.types.ts           # IPC channel types
│       │   └── common.types.ts
│       └── constants/                 # Shared constants
│           ├── channels.ts            # IPC channel names
│           └── config.ts              # App configuration
│
├── resources/                         # Static resources
│   ├── icons/                         # App icons
│   │   ├── icon.icns                  # macOS icon
│   │   ├── icon.ico                   # Windows icon
│   │   └── icon.png                   # Linux icon
│   └── ffmpeg/                        # FFmpeg binaries (bundled)
│       ├── darwin-x64/
│       ├── win32-x64/
│       └── linux-x64/
│
├── out/                               # Build output (gitignored)
├── dist/                              # Distribution packages (gitignored)
└── node_modules/                      # Dependencies (gitignored)
```

**Key Directory Explanations:**

- **`src/main/`** - Electron main process (Node.js environment)
  - Handles file system, FFmpeg, system APIs
  - No direct DOM access
  
- **`src/renderer/`** - React frontend (Browser environment)
  - UI components and user interactions
  - Communicates with main via IPC
  
- **`src/preload/`** - Bridge between main and renderer
  - Exposes safe IPC methods to renderer
  - Security boundary
  
- **`src/shared/`** - Code shared between main and renderer
  - Type definitions
  - Constants
  - Utility functions that work in both contexts

---

## Phase 0: Foundation (Day 1 Morning - 4 hours)

### PR-00: Project Bootstrap & Environment Setup
**Time Estimate**: 2-3 hours  
**Priority**: CRITICAL - Must complete first  
**Risk Level**: LOW

**Files to Create:**
```
📁 Root Level
├── package.json                       # Project dependencies and scripts
├── tsconfig.json                      # Base TypeScript config
├── tsconfig.main.json                 # Main process TypeScript config
├── tsconfig.renderer.json             # Renderer process TypeScript config
├── forge.config.js                    # Electron Forge configuration
├── webpack.config.js                  # Webpack bundling configuration
├── .gitignore                         # Git ignore rules
└── README.md                          # Project documentation

📁 src/main/
├── index.ts                           # Main process entry point
└── window.ts                          # Window creation and management

📁 src/renderer/
├── index.html                         # HTML template
├── index.tsx                          # Renderer entry point
├── App.tsx                            # Root React component
└── styles/
    └── index.css                      # Global styles

📁 src/preload/
└── index.ts                           # Preload script for IPC bridge

📁 src/shared/
├── types/
│   └── ipc.types.ts                   # IPC type definitions
└── constants/
    └── channels.ts                    # IPC channel name constants
```

**Tasks**:
- [x] Initialize Electron + React + TypeScript project
  ```bash
  npm init electron-app@latest clipforge -- --template=webpack-typescript
  cd clipforge
  ```
- [x] Install additional dependencies:
  ```bash
  npm install react react-dom
  npm install --save-dev @types/react @types/react-dom
  npm install zustand                  # State management
  ```
- [x] Configure project structure (create all folders above)
- [x] Setup TypeScript configs:
  - **`tsconfig.json`** - Base config extending strict mode
  - **`tsconfig.main.json`** - For main process (Node environment)
  - **`tsconfig.renderer.json`** - For renderer (DOM environment)
- [x] Configure webpack for main, preload, and renderer processes
- [x] Create **`src/main/index.ts`**:
  ```typescript
  import { app, BrowserWindow } from 'electron';
  import { createWindow } from './window';
  
  app.on('ready', createWindow);
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });
  ```
- [x] Create **`src/main/window.ts`**:
  ```typescript
  import { BrowserWindow } from 'electron';
  import path from 'path';
  
  export function createWindow(): BrowserWindow {
    const win = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false
      }
    });
    
    if (MAIN_WINDOW_WEBPACK_ENTRY) {
      win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    }
    
    return win;
  }
  ```
- [x] Create **`src/renderer/App.tsx`**:
  ```typescript
  import React from 'react';
  
  export const App: React.FC = () => {
    return (
      <div className="app">
        <h1>ClipForge</h1>
        <p>Desktop Video Editor</p>
      </div>
    );
  };
  ```
- [x] Create **`src/preload/index.ts`**:
  ```typescript
  import { contextBridge, ipcRenderer } from 'electron';
  
  contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (channel: string, data: any) => {
      ipcRenderer.send(channel, data);
    },
    onMessage: (channel: string, callback: Function) => {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  });
  ```
- [x] Create **`src/shared/constants/channels.ts`**:
  ```typescript
  export const IPC_CHANNELS = {
    TEST: 'test-channel',
    // More channels added in later PRs
  };
  ```
- [x] Setup **`.gitignore`**:
  ```
  node_modules/
  out/
  dist/
  .webpack/
  *.log
  .DS_Store
  ```
- [x] Create **`README.md`** with:
  - Project description
  - Installation: `npm install`
  - Development: `npm start`
  - Build: `npm run make`

**Acceptance Criteria**:
- ✅ `npm start` launches Electron app with React UI
- ✅ Hot reload works during development
- ✅ IPC test message successfully sent from renderer to main
- ✅ TypeScript compilation has no errors

**Status**: ✅ **COMPLETED**

**Deliverable**: Working Electron + React app skeleton

---

### PR-01: FFmpeg Integration & Build Configuration
**Time Estimate**: 2-3 hours  
**Priority**: CRITICAL - Required for MVP export  
**Risk Level**: MEDIUM (FFmpeg can be tricky)

**Files to Create:**
```
📁 src/main/services/
├── FFmpegService.ts                   # FFmpeg wrapper service
└── MetadataService.ts                 # Video metadata extraction

📁 resources/
└── ffmpeg/                            # FFmpeg binaries (download separately)
    ├── darwin-x64/
    │   └── ffmpeg
    ├── win32-x64/
    │   └── ffmpeg.exe
    └── linux-x64/
        └── ffmpeg

📁 src/main/utils/
└── paths.ts                           # Path resolution utilities
```

**Files to Update:**
```
📝 package.json                        # Add FFmpeg dependencies, build config
📝 forge.config.js                     # Update to bundle FFmpeg binaries
📝 src/shared/constants/channels.ts    # Add FFmpeg-related IPC channels
```

**Tasks**:
- [x] Install FFmpeg dependencies:
  ```bash
  npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg
  npm install --save-dev @types/fluent-ffmpeg
  ```
- [x] Create **`src/main/utils/paths.ts`**:
  ```typescript
  import path from 'path';
  import { app } from 'electron';
  
  export function getFFmpegPath(): string {
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      // Development: use node_modules binary
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
    return path.join(app.getPath('temp'), 'clipforge');
  }
  ```
- [x] Create **`src/main/services/FFmpegService.ts`**:
  ```typescript
  import ffmpeg from 'fluent-ffmpeg';
  import { getFFmpegPath } from '../utils/paths';
  
  export class FFmpegService {
    constructor() {
      ffmpeg.setFfmpegPath(getFFmpegPath());
    }
    
    async testInstallation(): Promise<boolean> {
      return new Promise((resolve) => {
        ffmpeg.getAvailableFormats((err, formats) => {
          resolve(!err && !!formats);
        });
      });
    }
    
    async concatenateVideos(
      inputPaths: string[],
      outputPath: string,
      onProgress?: (percent: number) => void
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        const command = ffmpeg();
        
        inputPaths.forEach(path => command.input(path));
        
        command
          .on('progress', (progress) => {
            if (onProgress && progress.percent) {
              onProgress(progress.percent);
            }
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .mergeToFile(outputPath);
      });
    }
    
    async trimVideo(
      inputPath: string,
      outputPath: string,
      trimStart: number,
      trimEnd: number
    ): Promise<void> {
      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(trimStart)
          .setDuration(trimEnd - trimStart)
          .output(outputPath)
          .videoCodec('libx264')
          .audioCodec('aac')
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });
    }
  }
  
  export const ffmpegService = new FFmpegService();
  ```
- [x] Create **`src/main/services/MetadataService.ts`**:
  ```typescript
  import ffmpeg from 'fluent-ffmpeg';
  
  export interface VideoMetadata {
    duration: number;
    width: number;
    height: number;
    format: string;
    codec: string;
    fileSize: number;
  }
  
  export class MetadataService {
    async getVideoMetadata(filePath: string): Promise<VideoMetadata> {
      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
          if (err) {
            reject(err);
            return;
          }
          
          const videoStream = metadata.streams.find(
            s => s.codec_type === 'video'
          );
          
          if (!videoStream) {
            reject(new Error('No video stream found'));
            return;
          }
          
          resolve({
            duration: metadata.format.duration || 0,
            width: videoStream.width || 0,
            height: videoStream.height || 0,
            format: metadata.format.format_name || '',
            codec: videoStream.codec_name || '',
            fileSize: metadata.format.size || 0
          });
        });
      });
    }
  }
  
  export const metadataService = new MetadataService();
  ```
- [x] Update **`webpack.config.js`** to handle FFmpeg externals:
  ```javascript
  // Added to mainConfig.externals
  externals: {
    '@ffmpeg-installer/ffmpeg': 'commonjs2 @ffmpeg-installer/ffmpeg',
    'fluent-ffmpeg': 'commonjs2 fluent-ffmpeg'
  }
  ```
- [x] Update **`forge.config.js`** to bundle FFmpeg:
  ```javascript
  module.exports = {
    packagerConfig: {
      extraResource: [
        './resources/ffmpeg'
      ]
    },
    makers: [
      {
        name: '@electron-forge/maker-dmg',
        config: {
          format: 'ULFO'
        }
      },
      {
        name: '@electron-forge/maker-zip',
        platforms: ['darwin', 'linux']
      },
      {
        name: '@electron-forge/maker-squirrel',
        config: {}
      }
    ]
  };
  ```
- [x] Update **`src/shared/constants/channels.ts`**:
  ```typescript
  export const IPC_CHANNELS = {
    TEST: 'test-channel',
    // FFmpeg channels
    FFMPEG_TEST: 'ffmpeg:test',
    VIDEO_METADATA: 'video:metadata',
  };
  ```
- [x] Update **`package.json`** scripts:
  ```json
  {
    "scripts": {
      "start": "electron-forge start",
      "package": "electron-forge package",
      "make": "electron-forge make",
      "test:ffmpeg": "node scripts/test-ffmpeg.js"
    }
  }
  ```
- [x] Use @ffmpeg-installer/ffmpeg for automatic FFmpeg binaries
- [x] Write test script to verify FFmpeg works:
  ```typescript
  // Create test in src/main/index.ts temporarily
  import { ffmpegService } from './services/FFmpegService';
  
  app.on('ready', async () => {
    const isWorking = await ffmpegService.testInstallation();
    console.log('FFmpeg working:', isWorking);
    createWindow();
  });
  ```
- [x] Test FFmpeg in development mode

**Acceptance Criteria**:
- ✅ FFmpeg executable found and working in dev mode
- ✅ Can extract metadata from test video file
- ✅ Can concatenate two test videos successfully
- ⏳ `npm run make` creates installable package (deferred to PR-07)
- ⏳ Packaged app can run FFmpeg commands (deferred to PR-07)

**Status**: ✅ **COMPLETED** (packaging deferred to PR-07)

**Deliverable**: FFmpeg integrated and tested, build pipeline working

---

## Phase 1: MVP Core - Import & Display (Day 1 Afternoon - 6 hours)

### PR-02: Video Import System
**Time Estimate**: 3-4 hours  
**Priority**: CRITICAL - MVP requirement  
**Risk Level**: LOW

**Files to Create:**
```
📁 src/renderer/store/
└── projectStore.ts                    # Main project state management

📁 src/renderer/components/MediaLibrary/
├── MediaLibrary.tsx                   # Main media library component
├── MediaLibrary.module.css            # Media library styles
├── MediaClipItem.tsx                  # Individual clip item
└── MediaClipItem.module.css           # Clip item styles

📁 src/renderer/hooks/
└── useMediaImport.ts                  # Custom hook for import logic

📁 src/renderer/utils/
├── fileValidation.ts                  # File validation utilities
└── ipcRenderer.ts                     # IPC wrapper functions

📁 src/renderer/types/
├── media.types.ts                     # Media-related types
└── project.types.ts                   # Project types

📁 src/main/ipc/
├── index.ts                           # IPC handler registration
├── fileHandlers.ts                    # File import handlers
└── videoHandlers.ts                   # Video metadata handlers
```

**Files to Update:**
```
📝 src/renderer/App.tsx                # Add MediaLibrary component
📝 src/preload/index.ts                # Expose file import APIs
📝 src/shared/constants/channels.ts    # Add import channels
```

**Tasks**:
- [x] Install Zustand for state management:
  ```bash
  npm install zustand
  ```
- [x] Create **`src/renderer/types/media.types.ts`**:
  ```typescript
  export interface MediaClip {
    id: string;
    name: string;
    filePath: string;
    duration: number;
    resolution: { width: number; height: number };
    format: string;
    fileSize: number;
    thumbnail?: string;
    createdAt: Date;
  }
  ```
- [x] Create **`src/renderer/store/projectStore.ts`**:
  ```typescript
  import { create } from 'zustand';
  import { MediaClip } from '../types/media.types';
  
  interface ProjectState {
    clips: MediaClip[];
    selectedClipId: string | null;
    addClip: (clip: MediaClip) => void;
    removeClip: (id: string) => void;
    selectClip: (id: string) => void;
  }
  
  export const useProjectStore = create<ProjectState>((set) => ({
    clips: [],
    selectedClipId: null,
    
    addClip: (clip) => set((state) => ({
      clips: [...state.clips, clip]
    })),
    
    removeClip: (id) => set((state) => ({
      clips: state.clips.filter(c => c.id !== id),
      selectedClipId: state.selectedClipId === id ? null : state.selectedClipId
    })),
    
    selectClip: (id) => set({ selectedClipId: id })
  }));
  ```
- [x] Create **`src/main/ipc/fileHandlers.ts`**:
  ```typescript
  import { dialog, ipcMain } from 'electron';
  import { IPC_CHANNELS } from '../../shared/constants/channels';
  
  export function registerFileHandlers() {
    ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async () => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Videos', extensions: ['mp4', 'mov', 'webm'] }
        ]
      });
      
      return result.filePaths;
    });
  }
  ```
- [x] Create **`src/main/ipc/videoHandlers.ts`**:
  ```typescript
  import { ipcMain } from 'electron';
  import { IPC_CHANNELS } from '../../shared/constants/channels';
  import { metadataService } from '../services/MetadataService';
  
  export function registerVideoHandlers() {
    ipcMain.handle(IPC_CHANNELS.VIDEO_METADATA, async (event, filePath: string) => {
      try {
        const metadata = await metadataService.getVideoMetadata(filePath);
        return { success: true, metadata };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }
  ```
- [x] Create **`src/main/ipc/index.ts`**
- [x] Update **`src/main/index.ts`** with IPC handlers
- [x] Update **`src/shared/constants/channels.ts`** with new channels
- [x] Update **`src/preload/index.ts`** to expose file import APIs
- [x] Create **`src/renderer/utils/ipcRenderer.ts`**:
  ```typescript
  declare global {
    interface Window {
      electronAPI: {
        openFile: () => Promise<string[]>;
        getVideoMetadata: (filePath: string) => Promise<any>;
      };
    }
  }
  
  export const { openFile, getVideoMetadata } = window.electronAPI;
  ```
- [x] Create **`src/renderer/hooks/useMediaImport.ts`**:
  ```typescript
  import { useState } from 'react';
  import { useProjectStore } from '../store/projectStore';
  import { openFile, getVideoMetadata } from '../utils/ipcRenderer';
  import { MediaClip } from '../types/media.types';
  
  export function useMediaImport() {
    const [importing, setImporting] = useState(false);
    const addClip = useProjectStore(state => state.addClip);
    
    const importFiles = async () => {
      try {
        setImporting(true);
        const filePaths = await openFile();
        
        for (const filePath of filePaths) {
          const result = await getVideoMetadata(filePath);
          
          if (result.success) {
            const clip: MediaClip = {
              id: `clip-${Date.now()}-${Math.random()}`,
              name: filePath.split('/').pop() || 'Unknown',
              filePath,
              duration: result.metadata.duration,
              resolution: {
                width: result.metadata.width,
                height: result.metadata.height
              },
              format: result.metadata.format,
              fileSize: result.metadata.fileSize,
              createdAt: new Date()
            };
            
            addClip(clip);
          }
        }
      } catch (error) {
        console.error('Import failed:', error);
      } finally {
        setImporting(false);
      }
    };
    
    return { importFiles, importing };
  }
  ```
- [x] Create **`src/renderer/components/MediaLibrary/MediaClipItem.tsx`**:
  ```typescript
  import React from 'react';
  import { MediaClip } from '../../types/media.types';
  import styles from './MediaClipItem.module.css';
  
  interface Props {
    clip: MediaClip;
    isSelected: boolean;
    onSelect: () => void;
  }
  
  export const MediaClipItem: React.FC<Props> = ({ clip, isSelected, onSelect }) => {
    return (
      <div 
        className={`${styles.clipItem} ${isSelected ? styles.selected : ''}`}
        onClick={onSelect}
      >
        <div className={styles.thumbnail}>
          📹
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{clip.name}</div>
          <div className={styles.metadata}>
            {Math.round(clip.duration)}s • {clip.resolution.width}x{clip.resolution.height}
          </div>
        </div>
      </div>
    );
  };
  ```
- [x] Create **`src/renderer/components/MediaLibrary/MediaLibrary.tsx`**:
  ```typescript
  import React from 'react';
  import { useProjectStore } from '../../store/projectStore';
  import { useMediaImport } from '../../hooks/useMediaImport';
  import { MediaClipItem } from './MediaClipItem';
  import styles from './MediaLibrary.module.css';
  
  export const MediaLibrary: React.FC = () => {
    const clips = useProjectStore(state => state.clips);
    const selectedClipId = useProjectStore(state => state.selectedClipId);
    const selectClip = useProjectStore(state => state.selectClip);
    const { importFiles, importing } = useMediaImport();
    
    return (
      <div className={styles.mediaLibrary}>
        <div className={styles.header}>
          <h2>Media Library</h2>
          <button onClick={importFiles} disabled={importing}>
            {importing ? 'Importing...' : 'Import'}
          </button>
        </div>
        
        <div className={styles.clipList}>
          {clips.map(clip => (
            <MediaClipItem
              key={clip.id}
              clip={clip}
              isSelected={clip.id === selectedClipId}
              onSelect={() => selectClip(clip.id)}
            />
          ))}
          
          {clips.length === 0 && (
            <div className={styles.empty}>
              No clips imported. Click Import to add videos.
            </div>
          )}
        </div>
      </div>
    );
  };
  ```
- [x] Create **`src/renderer/components/MediaLibrary/MediaLibrary.module.css`**:
  ```css
  .mediaLibrary {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #252526;
    border-right: 1px solid #3e3e42;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #3e3e42;
  }
  
  .header h2 {
    margin: 0;
    font-size: 16px;
    color: #fff;
  }
  
  .header button {
    padding: 8px 16px;
    background: #0e639c;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .header button:hover {
    background: #1177bb;
  }
  
  .clipList {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
  
  .empty {
    text-align: center;
    color: #ccc;
    padding: 32px;
  }
  ```
- [x] Update **`src/renderer/App.tsx`**:
  ```typescript
  import React from 'react';
  import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
  import './styles/index.css';
  
  export const App: React.FC = () => {
    return (
      <div className="app">
        <MediaLibrary />
      </div>
    );
  };
  ```
- [x] Add drag-and-drop support to MediaLibrary

**Acceptance Criteria**:
- ✅ User can click "Import" button and select video files
- ✅ User can drag & drop video files into app window
- ✅ Imported clips appear in MediaLibrary with metadata
- ✅ MP4, MOV, and WebM formats supported
- ⏳ Invalid files show error message (basic validation implemented)
- ✅ Multiple files can be imported sequentially

**Status**: ✅ **COMPLETED**

**Deliverable**: Working video import system

---

### PR-03: Video Preview Player
**Time Estimate**: 2-3 hours  
**Priority**: CRITICAL - MVP requirement  
**Risk Level**: LOW

**Files to Create:**
```
📁 src/renderer/components/PreviewPlayer/
├── PreviewPlayer.tsx                  # Main preview player component
├── PreviewPlayer.module.css           # Player styles
├── PlaybackControls.tsx               # Play/pause/seek controls
└── PlaybackControls.module.css        # Controls styles

📁 src/renderer/hooks/
└── useVideoPlayer.ts                  # Custom hook for player logic
```

**Files to Update:**
```
📝 src/renderer/App.tsx                # Add PreviewPlayer component
📝 src/renderer/store/projectStore.ts  # Add player state
```

**Tasks**:
- [x] Create **`src/renderer/hooks/useVideoPlayer.ts`**:
  ```typescript
  import { useRef, useState, useEffect } from 'react';
  
  export function useVideoPlayer() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    const play = () => {
      videoRef.current?.play();
      setIsPlaying(true);
    };
    
    const pause = () => {
      videoRef.current?.pause();
      setIsPlaying(false);
    };
    
    const togglePlayPause = () => {
      if (isPlaying) pause();
      else play();
    };
    
    const seek = (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    };
    
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;
      
      const handleTimeUpdate = () => setCurrentTime(video.currentTime);
      const handleLoadedMetadata = () => setDuration(video.duration);
      const handleEnded = () => setIsPlaying(false);
      
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('ended', handleEnded);
      
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('ended', handleEnded);
      };
    }, []);
    
    return {
      videoRef,
      isPlaying,
      currentTime,
      duration,
      play,
      pause,
      togglePlayPause,
      seek
    };
  }
  ```
- [x] Create **`src/renderer/components/PreviewPlayer/PlaybackControls.tsx`**:
  ```typescript
  import React from 'react';
  import styles from './PlaybackControls.module.css';
  
  interface Props {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    onPlayPause: () => void;
    onSeek: (time: number) => void;
  }
  
  export const PlaybackControls: React.FC<Props> = ({
    isPlaying,
    currentTime,
    duration,
    onPlayPause,
    onSeek
  }) => {
    const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      onSeek(time);
    };
    
    return (
      <div className={styles.controls}>
        <button onClick={onPlayPause} className={styles.playButton}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div className={styles.timeline}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeekBarChange}
            className={styles.seekBar}
          />
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>
    );
  };
  ```
- [x] Create **`src/renderer/components/PreviewPlayer/PreviewPlayer.tsx`**:
  ```typescript
  import React, { useEffect } from 'react';
  import { useProjectStore } from '../../store/projectStore';
  import { useVideoPlayer } from '../../hooks/useVideoPlayer';
  import { PlaybackControls } from './PlaybackControls';
  import styles from './PreviewPlayer.module.css';
  
  export const PreviewPlayer: React.FC = () => {
    const clips = useProjectStore(state => state.clips);
    const selectedClipId = useProjectStore(state => state.selectedClipId);
    
    const {
      videoRef,
      isPlaying,
      currentTime,
      duration,
      togglePlayPause,
      seek
    } = useVideoPlayer();
    
    const selectedClip = clips.find(c => c.id === selectedClipId);
    
    useEffect(() => {
      // Load new video when selection changes
      if (videoRef.current && selectedClip) {
        videoRef.current.load();
      }
    }, [selectedClip]);
    
    return (
      <div className={styles.previewPlayer}>
        <div className={styles.videoContainer}>
          {selectedClip ? (
            <video
              ref={videoRef}
              className={styles.video}
              src={`file://${selectedClip.filePath}`}
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className={styles.noVideo}>
              Select a clip to preview
            </div>
          )}
        </div>
        
        {selectedClip && (
          <PlaybackControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={togglePlayPause}
            onSeek={seek}
          />
        )}
      </div>
    );
  };
  ```
- [x] Create **`src/renderer/components/PreviewPlayer/PreviewPlayer.module.css`**:
  ```css
  .previewPlayer {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #1e1e1e;
  }
  
  .videoContainer {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    position: relative;
  }
  
  .video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
  
  .noVideo {
    color: #888;
    font-size: 18px;
  }
  ```
- [x] Create **`src/renderer/components/PreviewPlayer/PlaybackControls.module.css`**:
  ```css
  .controls {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #252526;
    border-top: 1px solid #3e3e42;
  }
  
  .playButton {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #0e639c;
    color: #fff;
    border: none;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .playButton:hover {
    background: #1177bb;
  }
  
  .timeline {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .time {
    color: #ccc;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
    min-width: 45px;
  }
  
  .seekBar {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: #3e3e42;
    outline: none;
    -webkit-appearance: none;
  }
  
  .seekBar::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #0e639c;
    cursor: pointer;
  }
  ```
- [x] Update **`src/renderer/App.tsx`**:
  ```typescript
  import React from 'react';
  import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
  import { PreviewPlayer } from './components/PreviewPlayer/PreviewPlayer';
  import './styles/index.css';
  
  export const App: React.FC = () => {
    return (
      <div className="app">
        <div className="sidebar">
          <MediaLibrary />
        </div>
        <div className="main">
          <PreviewPlayer />
        </div>
      </div>
    );
  };
  ```
- [x] Update **`src/renderer/styles/index.css`**:
  ```css
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #1e1e1e;
    color: #fff;
  }
  
  .app {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }
  
  .sidebar {
    width: 300px;
    height: 100%;
  }
  
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  ```
- ⏳ Add keyboard shortcuts (deferred)

**Acceptance Criteria**:
- ✅ Clicking clip in MediaLibrary loads it in player
- ✅ Play/Pause controls work correctly
- ✅ Current time and duration displayed accurately
- ✅ Video plays smoothly without stuttering
- ✅ Audio plays in sync with video
- ✅ Seek bar and controls functional

**Status**: ✅ **COMPLETED**

**Deliverable**: Functional video preview player

---

## Phase 2: MVP Core - Timeline & Editing (Day 2 Morning - 6 hours)

### PR-04: Basic Timeline UI & Single-Clip Display
**Time Estimate**: 3-4 hours  
**Priority**: CRITICAL - MVP requirement  
**Risk Level**: MEDIUM (Timeline UI can be complex)

**Tasks**:
- [ ] Create Timeline component structure:
  ```tsx
  // src/renderer/components/Timeline/Timeline.tsx
  - TimelineContainer (main wrapper)
  - TimelineRuler (time markers)
  - TimelineTrack (video track)
  - TimelineClip (individual clip visualization)
  - Playhead (current time indicator)
  ```
- [ ] Implement Timeline state:
  ```typescript
  interface TimelineState {
    clips: TimelineClip[];
    playheadPosition: number; // in seconds
    zoom: number; // pixels per second
    duration: number; // total timeline duration
  }
  
  interface TimelineClip {
    id: string;
    mediaClipId: string; // Reference to imported media
    startTime: number; // Position on timeline
    duration: number; // Actual duration on timeline
    trimStart: number; // Trim from original video start
    trimEnd: number; // Trim from original video end
  }
  ```
- [ ] Build TimelineRuler:
  - Display time markers (0s, 5s, 10s, etc.)
  - Scale based on zoom level
  - Show frames/seconds appropriately
- [ ] Create TimelineClip visualization:
  - Rectangle representing clip duration
  - Show clip name/thumbnail
  - Visual indication when selected
  - Display clip duration
- [ ] Implement Playhead:
  - Vertical line showing current time
  - Draggable to scrub through timeline
  - Sync with PreviewPlayer current time
- [ ] Add "Add to Timeline" functionality:
  - Drag clip from MediaLibrary to Timeline
  - OR: Click "Add to Timeline" button
  - Clip appears at end of timeline
- [ ] Basic timeline zoom controls:
  - Zoom in/out buttons
  - Adjust pixels-per-second ratio
  - Keep playhead centered on zoom
- [ ] Connect Timeline to PreviewPlayer:
  - Moving playhead updates preview
  - Playing video moves playhead
  - Two-way synchronization

**Acceptance Criteria**:
- ✅ Timeline displays imported clips visually
- ✅ Time ruler shows appropriate time markers
- ✅ Playhead visible and can be dragged
- ✅ Dragging playhead updates preview player
- ✅ Playing video in preview moves playhead
- ✅ Zoom controls adjust timeline scale
- ✅ Clips can be added from MediaLibrary to Timeline

**Deliverable**: Functional timeline UI showing clips

---

### PR-05: Trim Functionality (In-Out Points)
**Time Estimate**: 2-3 hours  
**Priority**: CRITICAL - MVP requirement  
**Risk Level**: LOW

**Tasks**:
- [ ] Add trim handles to TimelineClip:
  ```tsx
  // Visual trim handles on clip edges
  - Left handle (trim start)
  - Right handle (trim end)
  - Drag to adjust trim points
  ```
- [ ] Implement trim logic:
  ```typescript
  - onTrimStart(clipId, newTrimStart)
  - onTrimEnd(clipId, newTrimEnd)
  - Update clip duration accordingly
  - Validate trim bounds (can't trim past actual video duration)
  ```
- [ ] Visual feedback during trim:
  - Highlight trim handles on hover
  - Show trim preview in real-time
  - Display current trim values (e.g., "Start: 5s, End: 20s")
- [ ] Update preview player to respect trim:
  - When playing trimmed clip, start at trimStart
  - Stop at trimEnd
  - Seek operations respect trim bounds
- [ ] Add trim markers UI:
  - Optional: Show trim points in preview player timeline
  - Display "In" and "Out" points visually
- [ ] Implement reset trim:
  - Button to reset clip to original duration
  - Restore full video length

**Acceptance Criteria**:
- ✅ User can drag left handle to set trim start point
- ✅ User can drag right handle to set trim end point
- ✅ Clip duration updates visually on timeline
- ✅ Preview player respects trim points during playback
- ✅ Trim values displayed clearly
- ✅ Cannot trim beyond video boundaries
- ✅ Reset trim button restores original duration
- ✅ Synchronise preview seek bar with whichever clip is being trimmed (start or end) across multi-clip timelines

**Follow-up / Parking Lot:**
- [ ] Auto-pan the preview seek label when dragging end handles so the timecode anchors to the new out-point while still showing the combined timeline length
- [ ] Introduce explicit trim-handle focus state in the store to support future UX tweaks (e.g. snapping, keyboard nudge)

**Deliverable**: Working trim functionality on timeline clips

---

## Phase 3: MVP Core - Export (Day 2 Afternoon - 4 hours)

### PR-06: Single-Clip & Multi-Clip Export with FFmpeg
**Time Estimate**: 2-3 hours  
**Priority**: CRITICAL - MVP requirement  
**Risk Level**: MEDIUM (FFmpeg commands need testing)

**Status**: ✅ **COMPLETED** (2025-10-29)

**Tasks**:
- [x] Create Export Service in main process:
  ```typescript
  // src/main/services/ExportService.ts
  async function exportSingleClip(config: {
    inputPath: string;
    outputPath: string;
    trimStart: number;
    trimEnd: number;
    resolution?: '720p' | '1080p' | 'source';
  }): Promise<void>
  ```
- [x] Implement FFmpeg export command:
  ```bash
  # For trimmed single clip:
  ffmpeg -i input.mp4 -ss [trimStart] -to [trimEnd] \
    -c:v libx264 -preset medium -crf 23 \
    -c:a aac -b:a 192k \
    output.mp4
  ```
- [x] Add export progress tracking:
  - Parse FFmpeg output for progress
  - Send progress updates via IPC
  - Calculate estimated time remaining
- [x] Create Export Dialog UI:
  ```tsx
  // src/renderer/components/ExportDialog/ExportDialog.tsx
  - Output file name input
  - Resolution selector (720p, 1080p, source)
  - Destination folder picker
  - Export button
  - Progress bar
  - Cancel button
  ```
- [x] Implement export flow:
  ```typescript
  1. User clicks "Export" button
  2. Show export dialog
  3. User configures settings
  4. Send export request to main process
  5. Show progress bar
  6. On completion, show success message
  7. Option to open output folder
  ```
- [x] Handle export errors:
  - FFmpeg errors
  - Disk space issues
  - Invalid output path
  - User cancellation
- [x] Add export validation:
  - Check output path writable
  - Warn if overwriting existing file
  - Validate settings before export
- [x] Implement multi-clip concatenation:
  - Combine multiple trimmed clips into single output
  - Handle videos with/without audio streams
  - Normalize frame rates and resolutions
  - Complex filter for seamless concatenation

**Acceptance Criteria**:
- ✅ User can export single clip to MP4
- ✅ User can export multiple clips concatenated into one video
- ✅ Trim points respected in exported video
- ✅ Progress bar updates during export
- ✅ Exported video plays correctly in VLC/QuickTime
- ✅ Audio synced with video in output
- ✅ Handles videos with or without audio streams gracefully
- ✅ Error messages clear and actionable
- ✅ Can choose output resolution and quality
- ✅ Success/failure notifications displayed

**Deliverable**: Working export for single and multiple clips

---

### PR-07: Production Build & MVP Polish
**Time Estimate**: 2-3 hours  
**Priority**: CRITICAL - MVP requirement  
**Risk Level**: MEDIUM (Packaging can have surprises)

**Status**: ✅ **COMPLETED** (2025-10-29)

**Tasks**:
- [x] Configure production build environment:
  - Set NODE_ENV=production for build scripts
  - Configure Webpack mode based on environment
  - Remove DevTools in production
  - Disable console logs in production (Logger class)
- [x] Configure electron-builder properly:
  ```json
  // package.json
  "build": {
    "appId": "com.clipforge.app",
    "productName": "ClipForge",
    "mac": {
      "category": "public.app-category.video",
      "target": ["dmg", "zip"]
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    },
    "extraResources": [
      {
        "from": "node_modules/@ffmpeg-installer/darwin-x64",
        "to": "ffmpeg",
        "filter": ["**/*"]
      }
    ]
  }
  ```
- [x] Modern UI design implementation:
  - Dark theme with CSS variables
  - Professional header with logo and export button
  - Sidebar + main workspace layout
  - Modernized media library styling
  - Enhanced timeline with gradients and shadows
  - Polished export dialog with animations
  - Success/error message states
- [x] Test packaging:
  - Build for macOS (arm64)
  - Created DMG and ZIP installers
  - Signed with Apple Developer certificate
  - Ready for distribution
- [x] Fix packaging issues:
  - Path resolution (dev vs production)
  - Resource loading
  - FFmpeg binary location (@ffmpeg-installer/ffmpeg)
- [x] Add basic error logging:
  - Logger class with development/production modes
  - Suppress verbose logs in production
- [x] MVP UI polish:
  - Consistent dark theme styling
  - Loading states for async operations
  - Clear error messages with specific feedback
  - Export progress indicators
  - Success notifications
- [ ] Create app icon:
  - Design simple icon (or use placeholder)
  - Generate icon files (.icns, .ico)
  - Add to build config
- [ ] Test entire MVP flow:
  - Fresh install on clean system
  - Import video → trim → export
  - Verify exported video quality

**Acceptance Criteria**:
- ✅ `npm run build` compiles successfully in production mode
- ✅ `npm start` runs app without DevTools or console logs
- ✅ Full import → trim → export workflow works
- ✅ Multi-clip concatenation works
- ✅ Modern, professional UI implemented
- ✅ Export progress and success/error feedback working
- ✅ FFmpeg binary path correctly resolved in production
- ✅ `npm run package` creates installable DMG (123 MB)
- ✅ Package signed with Apple Developer certificate
- ⚠️ App uses default Electron icon (custom icon optional)

**Deliverable**: Production-ready packaged application for macOS

---

**🎯 MVP CHECKPOINT - READY FOR SUBMISSION ✅**

**MVP Deliverables Complete:**
- ✅ Desktop app that launches without DevTools
- ✅ Video import (drag & drop, file picker)
- ✅ Timeline showing multiple clips
- ✅ Preview player with playback controls
- ✅ Trim functionality with visual handles
- ✅ Single-clip export to MP4
- ✅ Multi-clip concatenation export
- ✅ Real-time export progress feedback
- ✅ Modern, professional dark-themed UI
- ✅ Production build configured
- ✅ **Packaged DMG installer (123 MB)**: `out/ClipForge-1.0.0-arm64.dmg`

**Location**: `/Users/sanjaykarinje/git/ClipForge/out/`

**Ready to Submit!** 🚀

---

## Phase 4: Full Product - Multi-Clip Timeline (Day 3 Morning - 4 hours)

### PR-08: Multi-Clip Timeline & Sequencing
**Time Estimate**: 3-4 hours  
**Priority**: HIGH - Core full-product feature  
**Risk Level**: MEDIUM

**Tasks**:
- [ ] Extend Timeline to support multiple clips:
  ```typescript
  // Update TimelineState
  interface TimelineState {
    clips: TimelineClip[]; // Array of clips in sequence
    // ... other fields
  }
  ```
- [ ] Implement clip arrangement logic:
  ```typescript
  - calculateClipPositions() // Auto-position clips sequentially
  - insertClip(clipId, position) // Add clip at specific time
  - reorderClips(fromIndex, toIndex) // Change sequence
  ```
- [ ] Add drag-and-drop reordering:
  - Use `react-dnd` or custom drag implementation
  - Visual feedback during drag
  - Snap to grid/other clips
  - Update clip positions on drop
- [ ] Implement clip snapping:
  - Snap to other clip edges
  - Snap to timeline markers
  - Configurable snap tolerance (e.g., 0.5s)
- [ ] Update preview to handle sequences:
  - When playhead crosses clip boundary, load next clip
  - Seamless transition between clips
  - Handle gaps in timeline (show black/pause)
- [ ] Add timeline navigation:
  - Zoom to fit all clips
  - Scroll horizontally for long timelines
  - Minimap showing full timeline (optional)
- [ ] Clip manipulation features:
  - Click to select clip
  - Delete key to remove clip
  - Duplicate clip
  - Split clip at playhead (bonus)

**Acceptance Criteria**:
- ✅ Multiple clips can be added to timeline
- ✅ Clips arranged sequentially by default
- ✅ User can drag clips to reorder them
- ✅ Preview plays clips in correct sequence
- ✅ Clips snap to each other during drag
- ✅ Selected clip highlighted visually
- ✅ Delete key removes selected clip

**Deliverable**: Timeline supporting multiple clips in sequence

---

### PR-09: Multi-Clip Export with Concatenation
**Time Estimate**: 2-3 hours  
**Priority**: HIGH - Required for full product  
**Risk Level**: MEDIUM (FFmpeg concat can be tricky)

**Tasks**:
- [ ] Update Export Service for multiple clips:
  ```typescript
  async function exportTimeline(config: {
    clips: Array<{
      inputPath: string;
      trimStart: number;
      trimEnd: number;
    }>;
    outputPath: string;
    resolution?: string;
  }): Promise<void>
  ```
- [ ] Implement FFmpeg concatenation:
  ```typescript
  // Approach: Create file list for concat demuxer
  // 1. Trim each clip to temp file
  // 2. Create concat.txt file listing temp clips
  // 3. Use concat demuxer to stitch together
  
  ffmpeg -f concat -safe 0 -i concat.txt \
    -c copy output.mp4
  
  // OR: Use filter_complex for more control
  ffmpeg -i clip1.mp4 -i clip2.mp4 -i clip3.mp4 \
    -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1" \
    output.mp4
  ```
- [ ] Handle mixed resolutions:
  - Scale all clips to target resolution
  - Add black bars if aspect ratios differ
  - Ensure consistent frame rates
- [ ] Add validation:
  - Check all clips are accessible
  - Warn about resolution mismatches
  - Estimate output file size
- [ ] Improve progress tracking:
  - Show which clip is currently processing
  - More accurate progress % for multi-clip export
- [ ] Add export preview:
  - Show list of clips to be exported
  - Display total output duration
  - Let user review before starting

**Acceptance Criteria**:
- ✅ Can export timeline with multiple clips
- ✅ Clips concatenated in correct order
- ✅ No glitches at clip boundaries
- ✅ Audio remains synced throughout
- ✅ Progress bar accurate for multi-clip export
- ✅ Handles clips with different resolutions
- ✅ Exported video plays smoothly in media players

**Deliverable**: Multi-clip concatenation in export

---

## Phase 5: Full Product - Recording Features (Day 3 Morning - 4 hours)

### PR-10: Screen Recording
**Time Estimate**: 3-4 hours  
**Priority**: HIGH - Key full-product feature  
**Risk Level**: HIGH (Platform-specific APIs)

**Tasks**:
- [ ] Research Electron screen capture:
  - Use `desktopCapturer` API
  - Handle permissions (macOS requires screen recording permission)
- [ ] Create Recording Service:
  ```typescript
  // src/main/services/RecordingService.ts
  - getAvailableSources() // List screens/windows
  - startRecording(sourceId, audioInput)
  - stopRecording()
  - saveRecording(blob, fileName)
  ```
- [ ] Implement screen source selection UI:
  ```tsx
  // src/renderer/components/RecordingPanel/SourceSelector.tsx
  - Show list of available screens
  - Show list of application windows
  - Thumbnail preview of each source
  - Select button for each source
  ```
- [ ] Setup MediaRecorder in renderer:
  ```typescript
  // Get screen stream from desktopCapturer
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: sourceId
      }
    }
  });
  
  // Add microphone audio
  const audioStream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
  
  // Combine streams
  const combinedStream = new MediaStream([
    ...stream.getVideoTracks(),
    ...audioStream.getAudioTracks()
  ]);
  
  // Record
  const recorder = new MediaRecorder(combinedStream);
  ```
- [ ] Create Recording Controls UI:
  ```tsx
  // src/renderer/components/RecordingPanel/RecordingControls.tsx
  - "Start Recording" button
  - Recording indicator (red dot, timer)
  - "Stop Recording" button
  - Audio input selector
  - Recording timer display
  ```
- [ ] Implement recording workflow:
  ```typescript
  1. User selects screen/window source
  2. User selects microphone input
  3. Click "Start Recording"
  4. Show recording indicator with timer
  5. Click "Stop Recording"
  6. Save recording as MP4
  7. Automatically add to MediaLibrary
  8. Optionally add to Timeline
  ```
- [ ] Handle recording errors:
  - Permission denied (screen recording)
  - Permission denied (microphone)
  - No audio devices found
  - Recording failed to save
- [ ] Add recording settings:
  - Video quality (resolution/bitrate)
  - Audio input selection
  - Frame rate (30fps vs 60fps)
- [ ] Test on target OS:
  - macOS: Request screen recording permission
  - Windows: Test window capture
  - Handle edge cases (source closed during recording)

**Acceptance Criteria**:
- ✅ User can see list of available screens/windows
- ✅ Can start screen recording with audio
- ✅ Recording timer displays during capture
- ✅ Can stop recording and save to file
- ✅ Recorded video automatically imported to MediaLibrary
- ✅ Audio captured clearly from microphone
- ✅ Permissions handled gracefully
- ✅ Recording quality acceptable (30fps minimum)

**Deliverable**: Functional screen recording

---

### PR-11: Webcam Recording
**Time Estimate**: 2 hours  
**Priority**: MEDIUM - Full product feature  
**Risk Level**: LOW (Standard web APIs)

**Tasks**:
- [ ] Create Webcam Recording UI:
  ```tsx
  // src/renderer/components/RecordingPanel/WebcamRecorder.tsx
  - Camera selector dropdown
  - Live webcam preview
  - Start/Stop recording buttons
  - Recording indicator
  ```
- [ ] Implement webcam capture:
  ```typescript
  // Get webcam stream
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: true
  });
  
  // Show preview
  videoElement.srcObject = stream;
  
  // Record
  const recorder = new MediaRecorder(stream);
  ```
- [ ] List available cameras:
  ```typescript
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(d => d.kind === 'videoinput');
  ```
- [ ] Add camera selection:
  - Dropdown with all available cameras
  - Switch camera without restarting recording
  - Remember last selected camera
- [ ] Implement recording flow:
  ```typescript
  1. Select camera from list
  2. Show live preview
  3. Start recording
  4. Stop recording
  5. Save as MP4
  6. Add to MediaLibrary
  ```
- [ ] Handle errors:
  - No camera found
  - Camera permission denied
  - Camera in use by another app
- [ ] Add webcam-specific settings:
  - Resolution (720p, 1080p)
  - Mirror preview option

**Acceptance Criteria**:
- ✅ Can select from available cameras
- ✅ Live preview shows camera feed
- ✅ Can record webcam with audio
- ✅ Recording saved and imported automatically
- ✅ Handles permission errors gracefully
- ✅ Works with multiple cameras if available

**Deliverable**: Webcam recording capability

---

## Phase 6: Full Product - Multi-Track (Day 3 Afternoon - 4 hours)

### PR-12: Multi-Track Timeline UI
**Time Estimate**: 2-3 hours  
**Priority**: MEDIUM - Full product feature  
**Risk Level**: MEDIUM

**Tasks**:
- [ ] Extend Timeline to support multiple tracks:
  ```typescript
  interface TimelineTrack {
    id: string;
    type: 'video' | 'audio' | 'overlay';
    clips: TimelineClip[];
    height: number; // Track height in pixels
    muted?: boolean;
  }
  
  interface TimelineState {
    tracks: TimelineTrack[];
    // ... other fields
  }
  ```
- [ ] Update Timeline UI structure:
  ```tsx
  <Timeline>
    <TimelineRuler />
    {tracks.map(track => (
      <TimelineTrack key={track.id}>
        {track.clips.map(clip => (
          <TimelineClip key={clip.id} />
        ))}
      </TimelineTrack>
    ))}
  </Timeline>
  ```
- [ ] Implement track management:
  - Add new track button
  - Delete track
  - Reorder tracks (drag tracks up/down)
  - Mute/unmute track
  - Solo track (mute others)
- [ ] Allow clips on different tracks:
  - Drag clip to different track
  - Clips can overlap on different tracks
  - Visualize track layers (top track = overlay)
- [ ] Update playhead behavior:
  - Playhead crosses all tracks
  - Preview shows composition of all visible tracks
- [ ] Add track labels:
  - Track name (editable)
  - Track type indicator (main, overlay, etc.)
  - Visual hierarchy

**Acceptance Criteria**:
- ✅ Timeline shows multiple tracks stacked vertically
- ✅ Can add/remove tracks
- ✅ Clips can be placed on any track
- ✅ Clips can overlap on different tracks
- ✅ Track mute/solo controls work
- ✅ Visual distinction between tracks

**Deliverable**: Multi-track timeline UI

---

### PR-13: Multi-Track Export with Composition
**Time Estimate**: 3-4 hours  
**Priority**: MEDIUM - Full product feature  
**Risk Level**: HIGH (Complex FFmpeg)

**Tasks**:
- [ ] Design composition strategy:
  ```typescript
  // For 2-track PiP:
  // Track 1: Main video (bottom layer)
  // Track 2: Overlay video (top layer, smaller, positioned)
  
  interface CompositionConfig {
    tracks: Array<{
      clips: TimelineClip[];
      layer: number; // 0 = bottom, higher = top
      position?: { x: number; y: number }; // For overlays
      scale?: number; // For overlays (0-1)
    }>;
  }
  ```
- [ ] Implement FFmpeg overlay filter:
  ```bash
  # Simple PiP: Overlay track 2 on track 1
  ffmpeg -i main.mp4 -i overlay.mp4 \
    -filter_complex "\
      [1:v]scale=iw*0.3:ih*0.3[pip];\
      [0:v][pip]overlay=W-w-10:H-h-10\
    " \
    -c:a copy output.mp4
  
  # Position overlay at bottom-right, scaled to 30%
  ```
- [ ] Handle multiple clips per track:
  ```typescript
  // Strategy:
  // 1. Concatenate clips within each track first
  // 2. Then composite tracks together
  
  // Pseudo-code:
  track1_concat = concatenateClips(track1.clips)
  track2_concat = concatenateClips(track2.clips)
  final = compositeVideos([track1_concat, track2_concat])
  ```
- [ ] Add composition settings UI:
  ```tsx
  // In export dialog:
  - PiP position selector (corner presets)
  - PiP size slider (10% - 50% of main video)
  - Track visibility toggles
  ```
- [ ] Implement "Preview Composition" button:
  ```typescript
  // Non-real-time preview (as recommended)
  async function renderPreviewComposition() {
    setPreviewLoading(true);
    
    // Use FFmpeg to create temp preview file
    const previewPath = await exportTimeline({
      ...config,
      outputPath: tempDir + '/preview.mp4'
    });
    
    // Load in preview player
    previewPlayer.src = previewPath;
    setPreviewLoading(false);
  }
  ```
- [ ] Handle audio mixing:
  - Mix audio from multiple tracks
  - Respect track mute settings
  - Balance audio levels
- [ ] Add export validation:
  - Warn if tracks have different resolutions
  - Check for overlapping audio
  - Estimate render time

**Acceptance Criteria**:
- ✅ Can export timeline with 2+ tracks
- ✅ Top track appears as overlay on bottom track
- ✅ PiP positioning works correctly
- ✅ Audio from both tracks mixed in output
- ✅ "Preview Composition" button generates preview
- ✅ Exported video shows correct layering
- ✅ No audio sync issues

**Deliverable**: Multi-track composition and export

---

## Phase 7: Full Product - Polish & Final Features (Day 3 Evening - 3 hours)

### PR-14: Timeline Split & Advanced Editing
**Time Estimate**: 1-2 hours  
**Priority**: LOW - Nice to have  
**Risk Level**: LOW

**Tasks**:
- [ ] Implement clip splitting:
  ```typescript
  function splitClip(clipId: string, splitTime: number) {
    // Create two new clips from one
    const clip = getClip(clipId);
    
    const clip1 = {
      ...clip,
      id: generateId(),
      duration: splitTime - clip.startTime,
      trimEnd: clip.trimStart + (splitTime - clip.startTime)
    };
    
    const clip2 = {
      ...clip,
      id: generateId(),
      startTime: splitTime,
      duration: clip.duration - (splitTime - clip.startTime),
      trimStart: clip.trimStart + (splitTime - clip.startTime)
    };
    
    // Replace original with two new clips
  }
  ```
- [ ] Add split UI:
  - Context menu on clip: "Split at Playhead"
  - Keyboard shortcut (Cmd/Ctrl + K)
  - Visual feedback when splitting
- [ ] Add delete with ripple:
  - Delete clip and close gap
  - Move all subsequent clips left
  - Option to delete without ripple (leave gap)
- [ ] Implement timeline zoom:
  - Zoom in/out buttons
  - Keyboard shortcuts (+/-)
  - Scroll to zoom
  - Zoom centered on playhead

**Acceptance Criteria**:
- ✅ Can split clip at playhead position
- ✅ Split creates two independent clips
- ✅ Both clips retain correct trim settings
- ✅ Ripple delete closes gaps
- ✅ Zoom controls work smoothly

**Deliverable**: Advanced timeline editing features

---

### PR-15: UI Polish & User Experience
**Time Estimate**: 2-3 hours  
**Priority**: MEDIUM - Professional appearance  
**Risk Level**: LOW

**Tasks**:
- [ ] Design consistent UI theme:
  ```typescript
  // Define color palette
  const theme = {
    primary: '#2E75B5',
    secondary: '#4472C4',
    background: '#1E1E1E',
    surface: '#252526',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#3E3E42',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336'
  };
  ```
- [ ] Apply consistent styling:
  - All buttons same style
  - Consistent spacing/padding
  - Unified color scheme
  - Professional typography
- [ ] Add loading states everywhere:
  - Skeleton loaders for media library
  - Spinners during import
  - Progress bars during export
  - Loading overlay for preview composition
- [ ] Improve error handling UI:
  - Toast notifications for errors
  - Clear error messages
  - Action buttons (Retry, Dismiss)
  - Error details in console/logs
- [ ] Add keyboard shortcuts:
  ```typescript
  Space: Play/Pause
  K: Play/Pause (alternative)
  J: Rewind
  L: Fast forward
  I: Set in point
  O: Set out point
  Cmd/Ctrl + Z: Undo
  Cmd/Ctrl + S: Save project
  Cmd/Ctrl + E: Export
  Delete/Backspace: Delete selected clip
  Cmd/Ctrl + K: Split clip
  ```
- [ ] Create keyboard shortcut help:
  - Modal showing all shortcuts
  - Cmd/Ctrl + ? to open
- [ ] Add tooltips:
  - Hover tooltips on all buttons
  - Explain what each control does
- [ ] Implement drag feedback:
  - Visual feedback during drag operations
  - Drop zones highlight
  - Cursor changes appropriately
- [ ] Add status bar:
  - Show playhead time
  - Show total timeline duration
  - Show export status
  - Show recording status

**Acceptance Criteria**:
- ✅ UI has consistent, professional appearance
- ✅ All async operations have loading states
- ✅ Keyboard shortcuts work as expected
- ✅ Error messages are clear and actionable
- ✅ Tooltips provide helpful information
- ✅ Status bar shows relevant information

**Deliverable**: Polished, professional UI

---

### PR-16: Project Save/Load & Final Testing
**Time Estimate**: 2 hours  
**Priority**: LOW - Nice to have  
**Risk Level**: LOW

**Tasks**:
- [ ] Design project file format:
  ```typescript
  interface ProjectFile {
    version: string;
    name: string;
    created: Date;
    modified: Date;
    timeline: {
      tracks: TimelineTrack[];
      duration: number;
    };
    media: {
      clips: MediaClip[];
    };
    settings: {
      resolution: string;
      frameRate: number;
    };
  }
  ```
- [ ] Implement save project:
  ```typescript
  // Save as JSON file
  async function saveProject(path: string) {
    const project: ProjectFile = {
      version: '1.0.0',
      name: getProjectName(),
      created: projectCreatedDate,
      modified: new Date(),
      timeline: serializeTimeline(),
      media: serializeMediaLibrary(),
      settings: getProjectSettings()
    };
    
    await fs.writeFile(path, JSON.stringify(project, null, 2));
  }
  ```
- [ ] Implement load project:
  ```typescript
  async function loadProject(path: string) {
    const content = await fs.readFile(path, 'utf-8');
    const project: ProjectFile = JSON.parse(content);
    
    // Validate file paths still exist
    // Restore timeline state
    // Restore media library
  }
  ```
- [ ] Add file menu:
  - New Project
  - Open Project
  - Save Project
  - Save Project As
  - Recent Projects list
- [ ] Handle unsaved changes:
  - Warn user before closing if unsaved
  - Prompt to save on quit
  - Auto-save every 5 minutes (optional)
- [ ] Comprehensive testing:
  ```typescript
  Test Scenarios:
  1. Import 5 clips, arrange on timeline, export
  2. Record screen, trim, add to timeline, export
  3. Multi-track: screen + webcam PiP, export
  4. Split clips, reorder, export
  5. Load large video files (>1GB)
  6. Timeline with 20+ clips
  7. Export very short clip (<1s)
  8. Export very long clip (>10min)
  9. Test with different video formats (MP4, MOV, WebM)
  10. Test with different resolutions (720p, 1080p, 4K)
  ```
- [ ] Performance testing:
  - Monitor memory usage during editing
  - Check for memory leaks
  - Test with long editing sessions (30+ min)
- [ ] Create demo video:
  - Record using ClipForge itself (dogfooding!)
  - Show complete workflow
  - Highlight key features
  - Keep it 3-5 minutes
- [ ] Update README:
  - Add screenshots
  - Detailed feature list
  - Usage examples
  - Troubleshooting section
  - Known limitations

**Acceptance Criteria**:
- ✅ Can save project to file
- ✅ Can load project from file
- ✅ Unsaved changes warning works
- ✅ All test scenarios pass
- ✅ No critical bugs found
- ✅ Demo video recorded
- ✅ README comprehensive

**Deliverable**: Feature-complete, tested application

---

**🎯 FINAL SUBMISSION - WEDNESDAY 10:59 PM CT**

Deliverables:
- ✅ GitHub repository with code
- ✅ Packaged desktop application (download link)
- ✅ Demo video (3-5 minutes)
- ✅ README with setup instructions
- ✅ Architecture overview document

---

## Optional Stretch Goals (If Time Permits)

These are NOT required but add polish if you have extra time:

### PR-17: Text Overlays
**Time Estimate**: 2-3 hours  
**Tasks**:
- Add text layer to timeline
- Text editor with fonts, colors, positioning
- Burn text into video using FFmpeg drawtext filter

### PR-18: Transitions
**Time Estimate**: 2-3 hours  
**Tasks**:
- Crossfade between clips
- Fade in/out effects
- FFmpeg xfade filter implementation

### PR-19: Audio Controls
**Time Estimate**: 1-2 hours  
**Tasks**:
- Volume adjustment per clip
- Fade in/out audio
- Audio waveform visualization

### PR-20: Undo/Redo
**Time Estimate**: 2-3 hours  
**Tasks**:
- Command pattern for all actions
- Undo/redo stack
- Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

---

## Development Workflow Best Practices

### Branching Strategy
```
main
  ├── PR-00-bootstrap
  ├── PR-01-ffmpeg
  ├── PR-02-import
  ├── ... etc
```

Each PR should:
1. Be independently testable
2. Have clear acceptance criteria
3. Include basic tests (manual OK for 72h sprint)
4. Be merged only when working

### Time Management
- **Day 1 (Monday)**: PR-00 through PR-03 (Foundation + Import/Preview)
- **Day 2 (Tuesday)**: PR-04 through PR-07 (Timeline + Export + Package) → **MVP SUBMIT**
- **Day 3 (Wednesday)**: PR-08 through PR-16 (Multi-clip + Recording + Multi-track + Polish) → **FINAL SUBMIT**

### If You Fall Behind
**Priority tiers:**
1. **Must have (MVP)**: PR-00 through PR-07
2. **Should have**: PR-08, PR-09, PR-10, PR-13
3. **Nice to have**: PR-11, PR-12, PR-14, PR-15
4. **Stretch**: PR-16 and beyond

If running out of time on Day 3, focus on:
1. Multi-clip export (PR-09)
2. Screen recording (PR-10)
3. Basic multi-track export (PR-13)
4. Skip: Webcam, UI polish, project save/load

### Debug Strategy
- Keep Chrome DevTools open at all times
- Log liberally (but remove before PRs)
- Test FFmpeg commands in terminal first
- Save test videos for quick testing

---

## Key Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Desktop Framework | Electron | Mature, better docs, faster for 72h |
| Frontend | React + TypeScript | Familiar, type safety |
| State Management | Zustand | Lightweight, simple |
| Video Processing | Native FFmpeg + fluent-ffmpeg | Best performance |
| Timeline | DOM-based → Canvas if needed | Fast development, optimize later |
| Multi-track Preview | Non-real-time (render button) | Faster to implement, reliable |
| Recording | desktopCapturer + MediaRecorder | Native APIs, platform support |

---

## Success Metrics

**MVP (Tuesday):**
- [ ] App launches in <5 seconds
- [ ] Import → Trim → Export workflow works end-to-end
- [ ] Exported video plays in VLC/QuickTime
- [ ] Package installs on clean system

**Full Product (Wednesday):**
- [ ] All MVP criteria +
- [ ] Can record screen with audio
- [ ] Can arrange 5+ clips on timeline
- [ ] Multi-track composition works
- [ ] No crashes during 15min session
- [ ] Demo video showcases all features

---

## Emergency Contacts & Resources

**If Stuck:**
- Electron docs: https://www.electronjs.org/docs
- FFmpeg docs: https://ffmpeg.org/ffmpeg.html
- React DnD: https://react-dnd.github.io/react-dnd/
- MediaRecorder API: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

**Common Gotchas:**
1. FFmpeg path resolution in packaged app
2. desktopCapturer permissions on macOS
3. MediaRecorder codec support varies by platform
4. File paths different in dev vs production

---

**Remember:** A working video editor that reliably imports, edits, and exports beats a feature-rich app that crashes. Ship the MVP, then iterate!
