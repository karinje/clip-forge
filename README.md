# ClipForge

A modern desktop video editor built with Electron, React, TypeScript, and FFmpeg.

## Overview

ClipForge is a professional desktop video editor featuring a dark, modern UI with powerful video editing capabilities. Import videos, trim clips, arrange them on a timeline, and export high-quality MP4 files with real-time progress feedback.

## 🎉 MVP Complete - All Core Features Implemented!

### ✅ Completed MVP Features
- ✅ **Desktop Application** - Native macOS app with production build
- ✅ **Video Import** - Drag & drop or file picker (MP4, MOV, WebM)
- ✅ **Timeline View** - Visual clip representation with multiple clips support
- ✅ **Video Preview Player** - Full playback controls (play/pause, seek, scrub)
- ✅ **Trim Functionality** - Visual trim handles with in/out points
- ✅ **Single-Clip Export** - Export individual trimmed clips to MP4
- ✅ **Multi-Clip Export** - Concatenate multiple clips into one video
- ✅ **Export Progress** - Real-time progress bar with percentage
- ✅ **Success/Error Feedback** - Clear notifications with output path
- ✅ **Modern UI** - Professional dark theme with CSS variables
- ✅ **Production Build** - No DevTools, no console logs
- ✅ **Native Packaging** - Installable DMG for macOS (123 MB)
- ✅ **Quality Settings** - High (1080p), Medium (720p), Low (480p)
- ✅ **Format Options** - MP4, WebM, MOV export formats

### 🚀 Advanced Features
- ✅ **Audio Handling** - Gracefully handles videos with or without audio
- ✅ **Frame Rate Normalization** - 30fps output for smooth playback
- ✅ **Resolution Scaling** - Automatic scaling with aspect ratio preservation
- ✅ **Complex Filters** - FFmpeg complex filter chains for seamless concatenation

### 📋 Planned Features (Post-MVP)
- 🎥 Screen recording with audio capture
- 📹 Webcam recording
- 🔄 Drag-and-drop clip reordering
- ✂️ Clip splitting at playhead
- 📊 Multi-track composition (Picture-in-Picture)
- ⌨️ Keyboard shortcuts
- 💾 Project save/load

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

1. **Import Videos**: 
   - Click the "Import" button in the Media Library
   - Or drag & drop video files directly into the app
   - Supports MP4, MOV, and WebM formats

2. **Add to Timeline**:
   - Select a clip in the Media Library
   - Drag it to the timeline at the bottom

3. **Trim Clips**:
   - Select a clip on the timeline
   - Drag the left handle to set start point
   - Drag the right handle to set end point
   - The preview player updates in real-time

4. **Preview**:
   - Click play/pause button
   - Scrub through timeline with seek bar
   - Preview respects all trim points

5. **Export**:
   - Click "Export Video" in the header
   - Choose output location and filename
   - Select quality (High/Medium/Low)
   - Select format (MP4/WebM/MOV)
   - Watch real-time progress bar
   - Get success notification with output path

## Screenshots

### Main Interface
Modern dark-themed UI with Media Library (left), Preview Player (center), and Timeline (bottom).

### Export Dialog
Real-time progress feedback with quality and format options.

## Development Status

### ✅ Completed (MVP - October 29, 2024)
- **PR-00**: Project Bootstrap & Environment Setup
- **PR-01**: FFmpeg Integration & Build Configuration
- **PR-02**: Video Import System
- **PR-03**: Video Preview Player
- **PR-04**: Basic Timeline UI & Single-Clip Display
- **PR-05**: Trim Functionality (In-Out Points)
- **PR-06**: Single-Clip & Multi-Clip Export with FFmpeg
- **PR-07**: Production Build & MVP Polish

### 📋 Planned (Post-MVP)
- **PR-08**: Multi-Clip Timeline & Sequencing
- **PR-09**: Enhanced Multi-Clip Export
- **PR-10**: Screen Recording
- **PR-11**: Webcam Recording
- **PR-12**: Multi-Track Timeline UI
- **PR-13**: Multi-Track Export with Composition

See `docs/ClipForge_Task_Breakdown.md` for detailed task breakdown.

## Known Limitations (MVP)

- Multi-track composition not yet implemented (single track only)
- Screen recording not yet implemented (planned for post-MVP)
- Webcam recording not yet implemented (planned for post-MVP)
- No undo/redo functionality yet
- No project save/load yet
- Default Electron icon (custom icon planned)

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

### v1.0.0 (October 29, 2024) - MVP Release
- Initial release with core video editing features
- Import, trim, timeline, export functionality
- Multi-clip concatenation support
- Modern dark-themed UI
- Production-ready macOS package

