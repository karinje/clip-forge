# ClipForge

A desktop video editor for screen recording, editing, and export - built with Electron, React, and TypeScript.

## Overview

ClipForge is a desktop video editor designed to compete with tools like CapCut by providing an accessible, intuitive interface for screen recording, video editing, and export. Built for rapid development with a focus on core functionality and reliability.

## Features

### MVP Features (Core)
- ✅ Desktop application (Electron-based)
- ✅ Video import (MP4, MOV, WebM)
- ✅ Timeline view with visual clip representation
- ✅ Video preview player with playback controls
- ✅ Basic trim functionality (in/out points)
- ✅ Export to MP4
- ✅ Native packaging for installation

### Full Product Features
- 🎥 Screen recording with audio capture
- 📹 Webcam recording
- 🎬 Multi-clip timeline editing
- 🔄 Drag-and-drop clip arrangement
- ✂️ Clip splitting at playhead
- 📊 Multi-track composition (Picture-in-Picture)
- ⚙️ Export settings (resolution options)
- ⌨️ Keyboard shortcuts

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

# Start development server
npm start
```

### Development

```bash
# Start app in development mode with hot reload
npm start

# Build for production
npm run package

# Create distributable installers
npm run make
```

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

1. **Import Video**: Drag & drop video files or click Import button
2. **Edit Timeline**: Add clips to timeline, trim, and arrange
3. **Preview**: Play and scrub through your composition
4. **Export**: Choose resolution and export to MP4

## Development Roadmap

- **Phase 0**: Foundation & Environment Setup
- **Phase 1**: MVP Core - Import & Display
- **Phase 2**: MVP Core - Timeline & Editing
- **Phase 3**: MVP Core - Export
- **Phase 4**: Multi-Clip Timeline
- **Phase 5**: Recording Features
- **Phase 6**: Multi-Track Composition
- **Phase 7**: Polish & Final Features

See `docs/ClipForge_Task_Breakdown.md` for detailed PR breakdown.

## Known Limitations

- Export limited to MP4 format
- Real-time multi-track preview not implemented (use "Render Preview" button)
- Screen recording requires system permissions (macOS: System Preferences → Privacy → Screen Recording)

## Contributing

This is a rapid development project. PRs should be focused, independently testable, and include clear acceptance criteria.

## Performance Targets

- App launch time: < 5 seconds
- Timeline responsiveness: No lag with 10+ clips
- Preview playback: Minimum 30 fps
- Export success rate: 100% (no crashes)

## License

MIT

## Acknowledgments

Built with Electron, React, FFmpeg, and lots of caffeine ☕

