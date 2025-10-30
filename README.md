# ClipForge

A modern desktop video editor built with Electron, React, TypeScript, and FFmpeg.

## Overview

ClipForge is a professional desktop video editor featuring a dark, modern UI with powerful video editing capabilities. Import videos, trim clips, arrange them on a timeline, and export high-quality MP4 files with real-time progress feedback.

## 🎉 Full Product Complete - Professional Video Editor!

### ✅ Core Editing Features
- ✅ **Desktop Application** - Native macOS app with production build (130 MB DMG)
- ✅ **Video Import** - Drag & drop or file picker (MP4, MOV, WebM)
- ✅ **Audio Import** - MP3, WAV, AAC, M4A, FLAC, OGG support
- ✅ **Timeline View** - Multi-track timeline with visual clip representation
- ✅ **Video Preview Player** - Full playback controls (play/pause, seek, scrub)
- ✅ **Trim Functionality** - Visual trim handles with in/out points
- ✅ **Split Clips** - Split at playhead (Cmd+K) with Loom-style behavior
- ✅ **Duplicate Clips** - Clone clips to end of track (Cmd+D)
- ✅ **Delete Regions** - Shift+Arrow selection for precise deletion
- ✅ **Timeline Zoom** - Zoom in/out/fit with horizontal scrolling
- ✅ **Snap-to-Grid** - Snap to grid/clip edges (Cmd+Shift+S)

### 🎥 Recording Features
- ✅ **Screen Recording** - Full screen or window capture with audio
- ✅ **Webcam Recording** - Camera recording with system camera access
- ✅ **Screen + Camera (PiP)** - **NEW!** Simultaneous capture with live preview
  - Real-time PiP composition during recording
  - Camera overlay at 25% scale (bottom-right)
  - See exactly what you're recording (WYSIWYG)
  - Combined microphone audio
  - Canvas-based composition at 30 FPS
- ✅ **Save to Timeline** - Recordings automatically added to project

### 🎵 Audio Features
- ✅ **Audio Import** - MP3 and other audio formats
- ✅ **Audio-Only Mode** - Extract audio from video clips
- ✅ **Volume Control** - Per-track volume (0-200%) with sliders
- ✅ **Audio Mixing** - Mix multiple audio tracks in export
- ✅ **Track Mute/Solo** - Mute or solo individual tracks
- ✅ **Background Music** - Add music with adjustable volume

### 📤 Export Features
- ✅ **Multi-Track Export** - Picture-in-Picture composition
- ✅ **Audio Mixing** - Mix main video + overlay audio tracks
- ✅ **Export Settings** - Persistent configuration (format, quality, duration mode)
- ✅ **Preview Composition** - Render preview before final export
- ✅ **Progress Tracking** - Real-time progress bar with percentage
- ✅ **Quality Options** - High (1080p), Medium (720p), Low (480p)
- ✅ **Format Options** - MP4, WebM, MOV export formats
- ✅ **PiP Configuration** - Adjustable position and scale
- ✅ **Duration Modes** - Main track, shortest, or longest duration

### ⌨️ Keyboard Shortcuts
- ✅ **Space** - Play/pause
- ✅ **J/L** - Rewind/Forward 5 seconds
- ✅ **[ / ]** - Jump to clip edges
- ✅ **Cmd+K** - Split clip at playhead
- ✅ **Cmd+D** - Duplicate clip
- ✅ **Cmd+E** - Export video
- ✅ **Cmd+?** - Show shortcuts help
- ✅ **Shift+Arrow** - Extend selection for deletion
- ✅ **Escape** - Clear selection

### 🎨 UI/UX Features
- ✅ **Professional Dark Theme** - Modern, polished interface
- ✅ **Collapsible Sidebar** - Toggle media library visibility
- ✅ **Resizable Panels** - Drag borders to adjust layout
- ✅ **Thumbnail Previews** - FFmpeg-generated thumbnails
- ✅ **Time Display Toggle** - MM:SS.CC or MM:SS format
- ✅ **Status Bar** - Playhead time, clip info, zoom level
- ✅ **Tooltips** - Helpful hints on all interactive elements
- ✅ **Shortcuts Modal** - Quick reference guide (Cmd+?)

### 📋 Stretch Goals (Optional)
- ⏳ **Video Speed Adjustment** - Slow motion and fast forward
- ⏳ **Text Overlays** - Custom text with fonts and positioning
- ⏳ **Transitions** - Fade, slide between clips
- ⏳ **Audio Fade Effects** - Fade in/out
- ⏳ **Filters & Effects** - Brightness, contrast, saturation
- ⏳ **Export Presets** - YouTube, Instagram, TikTok optimized
- ⏳ **Project Save/Load** - Persistent project files
- ⏳ **Undo/Redo** - Command history

## Tech Stack

- **Desktop Framework**: Electron 28+
- **Frontend**: React 18 + TypeScript
- **State Management**: Zustand
- **Media Processing**: FFmpeg + fluent-ffmpeg
- **Build Tool**: Electron Forge + Webpack
- **Recording**: MediaRecorder API + Electron desktopCapturer

## Architecture

```
ClipForge
├── Main Process (Electron/Node.js)
│   ├── IPC Handlers (File, Video, Export, Recording)
│   └── Services (FFmpeg, Metadata, Export, Recording)
├── Renderer Process (React)
│   ├── Components (MediaLibrary, Timeline, PreviewPlayer)
│   ├── Store (Zustand state management)
│   └── Hooks (Custom logic hooks)
└── Preload Bridge (IPC security layer)
```

See `architecture_diagrams/01_architecture.mermaid` for detailed architecture diagram.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- FFmpeg (bundled with app in production)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ClipForge.git
cd ClipForge

# Install dependencies
npm install
```

### Development

```bash
# Start app in development mode
npm start

# Build for production
npm run build

# Create packaged app (DMG for macOS)
npm run package
```

### Installing from DMG (macOS)

1. **Open the DMG**:
   ```bash
   open out/ClipForge-1.0.0-arm64.dmg
   ```
   Or double-click `ClipForge-1.0.0-arm64.dmg` in Finder

2. **Install the App**:
   - A Finder window will open showing ClipForge.app
   - Drag `ClipForge.app` to your Applications folder
   - Or run directly from the DMG (not recommended for permanent use)

3. **First Launch**:
   - Open ClipForge from Applications
   - If you see "App is from an unidentified developer":
     - Right-click ClipForge.app → Open
     - Click "Open" in the security dialog
     - This only needs to be done once

4. **Verify Installation**:
   - App should launch without DevTools
   - No console logs in production mode
   - Import a video to test functionality

## Testing the Packaged DMG

### Before Distribution:
1. **Mount the DMG**:
   ```bash
   open out/ClipForge-1.0.0-arm64.dmg
   ```

2. **Copy to Applications** (simulates user installation):
   ```bash
   cp -r /Volumes/ClipForge/ClipForge.app /Applications/
   ```

3. **Launch from Applications**:
   ```bash
   open /Applications/ClipForge.app
   ```

4. **Test Workflow**:
   - Import a video file
   - Add to timeline
   - Trim the clip
   - Export to desktop
   - Verify no DevTools appear
   - Verify no console logs

5. **Clean Up After Testing**:
   ```bash
   rm -rf /Applications/ClipForge.app
   hdiutil detach /Volumes/ClipForge
   ```

### Distribution Checklist:
- ✅ DMG opens without errors
- ✅ App icon visible in DMG window
- ✅ Drag-to-Applications works
- ✅ First launch security prompt handled
- ✅ All features work as expected
- ✅ Export creates valid video files
- ✅ No crashes during normal use

## Project Structure

```
clipforge/
├── src/
│   ├── main/          # Electron main process
│   │   ├── ipc/       # IPC handlers
│   │   └── services/  # Business logic (FFmpeg, Export, etc.)
│   ├── renderer/      # React frontend
│   │   ├── components/
│   │   ├── store/     # Zustand state
│   │   └── hooks/
│   ├── preload/       # IPC bridge (security)
│   └── shared/        # Shared types and constants
├── resources/         # Static assets (icons, FFmpeg binaries)
└── docs/              # Documentation
```

## Usage

### Recording
1. **Screen Recording**:
   - Click the "Record" button (top left)
   - Select "Screen" tab
   - Choose a screen or window to record
   - Click "Start Recording"
   - Click "Stop Recording" when done
   - Recording automatically added to timeline

2. **Webcam Recording**:
   - Click "Record" → "Webcam" tab
   - Click "Start Recording"
   - Recording appears in timeline when stopped

3. **Screen + Camera (PiP)**:
   - Click "Record" → "Screen + Camera" tab
   - Select screen source
   - See live PiP preview during recording
   - Camera appears in bottom-right at 25% scale
   - Perfect for tutorials and presentations!

### Editing
4. **Import Videos**: 
   - Click "Import" in Media Library
   - Or drag & drop files into the app
   - Supports MP4, MOV, WebM, MP3, WAV, etc.

5. **Timeline Editing**:
   - Drag clips from library to timeline
   - Use trim handles to adjust start/end points
   - **Cmd+K** to split clip at playhead
   - **Shift+Arrow** to select region, **Delete** to remove
   - Add overlay tracks for PiP or audio

6. **Audio**:
   - Import MP3 files for background music
   - Toggle audio-only mode on video clips
   - Adjust volume per track (0-200%)
   - Mute or solo individual tracks

### Export
7. **Configure Export**:
   - Click "Export Settings" (gear icon)
   - Set format, quality, PiP position/scale
   - Settings persist across sessions

8. **Preview & Export**:
   - Click "Preview" to render test video
   - Click "Export Video" for final output
   - Choose location and filename
   - Watch real-time progress
   - Success notification with file path

## Screenshots

### Main Interface
Modern dark-themed UI with Media Library (left), Preview Player (center), and Timeline (bottom).

### Export Dialog
Real-time progress feedback with quality and format options.

## Development Status

### ✅ Completed (Full Product - October 30, 2025)

**MVP Phase (October 28-29)**:
- **PR-00**: Project Bootstrap & Environment Setup
- **PR-01**: FFmpeg Integration & Build Configuration
- **PR-02**: Video Import System
- **PR-03**: Video Preview Player
- **PR-04**: Basic Timeline UI & Single-Clip Display
- **PR-05**: Trim Functionality (In-Out Points)
- **PR-06**: Single-Clip & Multi-Clip Export with FFmpeg
- **PR-07**: Production Build & MVP Polish

**Full Product Phase (October 30)**:
- **PR-08**: Multi-Clip Timeline & Sequencing
- **PR-09**: Multi-Clip Export with Concatenation
- **PR-10**: Screen Recording with desktopCapturer
- **PR-11**: Webcam Recording with MediaRecorder
- **PR-12**: Multi-Track Timeline UI (up to 3 tracks)
- **PR-13**: Multi-Track Export with PiP Composition
- **PR-14**: Split, Duplicate, Delete Trimmed Region
- **PR-15**: Thumbnails, Snap, Solo Track, Shortcuts
- **PR-16**: Audio Overlay & Export Modal Polish
- **Export Settings**: Persistent configuration panel
- **Screen + Camera**: Simultaneous PiP recording with live preview

### ⏳ Optional Enhancements
- **PR-17**: Project Save/Load (JSON format)
- **PR-18**: Audio fade effects, enhanced shortcuts
- **PR-19**: Text overlays, transitions, filters
- **Video Speed Adjustment**: Slow motion, fast forward

See `docs/ClipForge_Task_Breakdown.md` for detailed task breakdown.

## Known Limitations

- Project save/load not implemented (uses session storage)
- No undo/redo functionality yet (manual clip management)
- Default Electron icon (custom icon not critical)
- Single platform build (macOS arm64 only)
- No video speed adjustment yet
- No text overlays or transitions yet

## Contributing

This is a rapid development project. PRs should be focused, independently testable, and include clear acceptance criteria.

## Performance & Quality

- ✅ App launch time: < 3 seconds
- ✅ Timeline responsiveness: Handles multiple clips smoothly
- ✅ Preview playback: 30+ fps
- ✅ Export quality: High-quality H.264 encoding
- ✅ Export reliability: Handles videos with/without audio
- ✅ File size: DMG installer is 123 MB (includes FFmpeg)

## Technical Achievements

- **Production Build**: Webpack configured for development/production modes
- **FFmpeg Integration**: Complex filter chains for seamless concatenation
- **Audio Handling**: Graceful handling of mixed audio/video streams
- **IPC Communication**: Real-time progress updates from main to renderer
- **Modern UI**: CSS variables, animations, responsive layout
- **Error Handling**: Clear user feedback for all operations
- **Logging**: Development-only logging with production suppression

## License

MIT

## System Requirements

### macOS (Current Build)
- macOS 11.0 or later
- Apple Silicon (M1/M2/M3) - arm64 architecture
- 4GB RAM minimum (8GB recommended)
- 500MB free disk space
- Screen resolution: 1280x800 minimum

### Future Builds
- Intel Mac (x64) - Coming soon
- Windows 10/11 (x64) - Coming soon
- Linux (AppImage/deb) - Planned

## Troubleshooting

### "App is damaged" or "Cannot open" error
This happens because the app isn't notarized by Apple. Solution:
1. Right-click ClipForge.app → Open
2. Click "Open" in the security dialog
3. Or disable Gatekeeper temporarily (not recommended):
   ```bash
   sudo xattr -cr /Applications/ClipForge.app
   ```

### FFmpeg errors during export
- Make sure the video file isn't corrupted
- Try a different video format (MP4, MOV, WebM)
- Check available disk space for export

### App won't launch
- Check Console.app for error messages
- Try removing and reinstalling from DMG
- Verify macOS version is 11.0 or later

## Acknowledgments

Built with Electron, React, TypeScript, FFmpeg, and dedication to quality UX.

## Version History

### v1.2.0 (October 30, 2025) - Screen + Camera PiP Release
- **NEW**: Screen + Camera simultaneous recording with live PiP preview
- Canvas-based real-time composition at 30 FPS
- Camera overlay at 25% scale with white border
- WYSIWYG recording experience
- Fixed canvas rendering for live preview visibility

### v1.1.0 (October 30, 2025) - Audio & Export Polish
- Audio import (MP3, WAV, AAC, M4A, FLAC, OGG)
- Audio-only mode for video overlay tracks
- Per-track volume control (0-200%)
- Multi-track audio mixing in export
- Export Settings panel with persistence
- Preview Composition feature
- Duration mode options (main/shortest/longest)
- Header layout optimization

### v1.0.0 (October 29, 2025) - Full Product Release
- Multi-track timeline (up to 3 tracks)
- Screen recording with desktopCapturer
- Webcam recording with MediaRecorder
- Multi-track PiP export composition
- Split, duplicate, delete trimmed regions
- Keyboard shortcuts (J/L/[]/Cmd+K/D/E/?)
- Thumbnails, snap-to-grid, time display toggle
- Solo track, status bar, shortcuts modal
- Professional dark-themed UI

### v0.1.0 (October 28, 2025) - MVP Release
- Initial release with core video editing features
- Import, trim, timeline, export functionality
- Multi-clip concatenation support
- Modern dark-themed UI
- Production-ready macOS package

