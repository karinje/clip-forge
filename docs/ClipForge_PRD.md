# ClipForge
## Product Requirements Document

---

## Executive Summary

ClipForge is a desktop video editor designed to compete with tools like CapCut by providing an accessible, intuitive interface for screen recording, video editing, and export. The project operates on an aggressive 72-hour timeline with two critical milestones: an MVP submission on Tuesday, October 28th at 10:59 PM CT, and a full feature submission on Wednesday, October 29th at 10:59 PM CT.

This PRD defines the scope for both milestones, provides detailed user stories, recommends a technical stack optimized for rapid development, and analyzes critical trade-offs and potential pitfalls that could impact delivery.

---

## Project Timeline

| Milestone | Deadline & Requirements |
|-----------|------------------------|
| **MVP** | Tuesday, October 28, 2025 at 10:59 PM CT - Core functionality demonstrating ability to handle media files in desktop context |
| **Full Submission** | Wednesday, October 29, 2025 at 10:59 PM CT - Complete feature set with recording, editing, and export capabilities |

---

## MVP Requirements (Tuesday Deadline)

**Priority:** This is a hard gate. All MVP requirements must be met to proceed.

**Goal:** Prove the ability to handle media files in a desktop context with basic import, display, trim, and export functionality.

### Core MVP Features

1. **Desktop Application Launch** - Packaged native app (Electron or Tauri) that launches successfully, not just dev mode
2. **Video Import** - Drag & drop or file picker for MP4/MOV files
3. **Timeline View** - Simple visual timeline showing imported clips
4. **Video Preview Player** - Plays imported clips with basic controls
5. **Basic Trim Functionality** - Set in/out points on a single clip
6. **Export to MP4** - Successfully exports edited video, even if single clip
7. **Native Packaging** - Built and packaged as installable desktop application

---

## Full Product Requirements (Wednesday Deadline)

### Recording Features

1. Screen recording with full screen or window selection
2. Webcam recording with system camera access
3. Simultaneous screen + webcam recording (picture-in-picture)
4. Audio capture from microphone
5. Save recordings directly to timeline

### Import & Media Management

1. Support for MP4, MOV, and WebM formats
2. Drag and drop interface for file import
3. Media library panel with imported clips
4. Thumbnail previews of clips
5. Metadata display (duration, resolution, file size)

### Timeline Editor

1. Visual timeline with playhead indicator
2. Drag clips onto timeline
3. Arrange clips in sequence
4. Trim clips (adjust start/end points)
5. Split clips at playhead position
6. Delete clips from timeline
7. Multiple tracks (minimum 2: main video + overlay/PiP)
8. Timeline zoom (in/out for precision editing)
9. Snap-to-grid or snap-to-clip edges

### Preview & Playback

1. Real-time preview of timeline composition
2. Play/pause controls
3. Scrubbing (drag playhead to any position)
4. Audio playback synchronized with video
5. Preview window shows current frame at playhead

### Export & Sharing

1. Export timeline to MP4
2. Resolution options (720p, 1080p, source resolution)
3. Progress indicator during export
4. Save to local file system

### Stretch Goals (If Time Permits)

1. Text overlays with custom fonts
2. Transitions between clips (fade, slide)
3. Audio controls (volume, fade in/out)
4. Filters and effects (brightness, contrast, saturation)
5. Export presets (YouTube, Instagram, TikTok)
6. Keyboard shortcuts
7. Auto-save project state
8. Undo/redo functionality

---

## User Stories

### MVP User Stories

#### US-MVP-01: Import Video

**As a** content creator, **I want to** import video files from my computer, **so that** I can start editing existing footage.

**Acceptance Criteria:**
- User can drag and drop MP4 or MOV files into the application
- User can use file picker to browse and select video files
- Imported files appear in the timeline view

#### US-MVP-02: Preview Video

**As a** content creator, **I want to** preview my imported clips, **so that** I can verify the content before editing.

**Acceptance Criteria:**
- Video player displays selected clip
- Play/pause controls function correctly
- Audio plays in sync with video

#### US-MVP-03: Trim Video

**As a** content creator, **I want to** set in and out points on a clip, **so that** I can remove unwanted footage.

**Acceptance Criteria:**
- User can mark the start point of a clip
- User can mark the end point of a clip
- Trimmed clip reflects changes in preview

#### US-MVP-04: Export Video

**As a** content creator, **I want to** export my edited video to MP4 format, **so that** I can share it on other platforms.

**Acceptance Criteria:**
- Export function creates valid MP4 file
- Exported video plays correctly in standard media players
- File is saved to user-specified location

### Full Product User Stories

#### US-FULL-01: Screen Recording

**As a** tutorial creator, **I want to** record my screen with audio, **so that** I can create instructional content without external tools.

**Acceptance Criteria:**
- User can select full screen or specific window to record
- Audio from microphone is captured
- Recording appears directly in timeline after stopping
- Start/stop controls are intuitive and responsive

#### US-FULL-02: Webcam Recording

**As a** vlogger, **I want to** record myself using my webcam, **so that** I can add personal commentary to my videos.

**Acceptance Criteria:**
- Application detects and lists available webcams
- User can start/stop webcam recording
- Recording is saved and added to timeline

#### US-FULL-03: Timeline Arrangement

**As a** video editor, **I want to** drag and arrange multiple clips on a timeline, **so that** I can control the sequence and pacing of my video.

**Acceptance Criteria:**
- User can drag clips from media library to timeline
- User can reorder clips by dragging
- Timeline shows visual representation of clip duration
- Playhead indicates current position

#### US-FULL-04: Clip Splitting

**As a** video editor, **I want to** split clips at specific points, **so that** I can rearrange or remove sections independently.

**Acceptance Criteria:**
- User can position playhead at desired split point
- Split function divides clip into two independent clips
- Both resulting clips can be manipulated independently

#### US-FULL-05: Multi-Track Editing

**As a** content creator, **I want to** overlay my webcam on top of screen recordings, **so that** viewers can see both my face and what I'm demonstrating.

**Acceptance Criteria:**
- Timeline supports at least 2 video tracks
- Upper track displays as picture-in-picture over lower track
- Preview accurately shows layered composition

---

## Recommended Tech Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Desktop Framework** | Electron 28+ | Mature ecosystem, extensive documentation, better for 72-hour timeline. Built-in desktopCapturer API for screen recording. |
| **Frontend Framework** | React 18 + TypeScript | Most familiar to developers, excellent component ecosystem, TypeScript for catching errors early. |
| **Media Processing** | FFmpeg + fluent-ffmpeg | Industry standard for video processing. Fluent-ffmpeg provides Node.js wrapper. Bundle FFmpeg binary with app. |
| **Timeline UI** | HTML5 Canvas + React-DnD or custom DOM solution | Canvas for performance with many clips. React-DnD for intuitive drag-and-drop. Start with DOM, migrate to Canvas if needed. |
| **Video Player** | HTML5 video element | Native, no dependencies, sufficient for preview. Can enhance with Video.js if needed for controls. |
| **State Management** | React Context API or Zustand | Context API for simple state. Zustand if complexity grows. Avoid Redux overhead for 72-hour project. |
| **Recording** | MediaRecorder API + Electron desktopCapturer | Native browser APIs for webcam, Electron desktopCapturer for screen. No external dependencies needed. |
| **Build/Package** | electron-builder | Standard tool for packaging Electron apps. Handles Mac, Windows, Linux builds. Supports code signing. |

### Alternative Considerations

#### Tauri Instead of Electron

**Pros:** Smaller bundle size, better performance, Rust backend

**Cons:** Less mature, requires Rust knowledge for screen capture, less documentation, higher risk for 72-hour timeline

**Recommendation:** Stick with Electron unless team has strong Rust experience

---

## Architecture Overview

### System Components

#### Main Process (Electron)
- Handles file system operations (import/export)
- Manages FFmpeg processes for video encoding
- Provides IPC communication with renderer
- Handles window management and app lifecycle

#### Renderer Process (React)
- UI components (Timeline, MediaLibrary, PreviewPlayer)
- State management for project data
- Recording controls using MediaRecorder API
- Preview rendering and playback

#### Media Processing Layer
- FFmpeg integration for encoding/decoding
- Video metadata extraction
- Thumbnail generation
- Clip trimming and concatenation logic

### Data Flow

- User imports video → Main process reads file → Metadata extracted → Clip added to project state
- User drags clip to timeline → Timeline state updated → Preview updates to show composition
- User clicks export → Timeline data sent to main process → FFmpeg stitches clips → Output file saved
- User starts recording → MediaRecorder captures stream → Blob saved → Video added to timeline

---

## Critical Pitfalls & Trade-offs

### High-Risk Areas

#### 1. FFmpeg Integration Complexity

**Risk:** FFmpeg is powerful but has a steep learning curve. Incorrect parameters can lead to corrupted output, massive file sizes, or encoding failures.

**Mitigation:**
- Test export functionality on Day 1 with simple clip concatenation
- Use proven FFmpeg command patterns (avoid complex filters initially)
- Start with H.264 codec, AAC audio, MP4 container (most compatible)
- Bundle FFmpeg binary rather than relying on system installation

#### 2. Real-time Preview Performance

**Risk:** Rendering multiple video tracks in real-time is CPU intensive. Poor performance breaks the editing experience.

**Mitigation:**
- Use native HTML5 video element for single-track preview (fast)
- For multi-track: composite only on demand, not continuously
- Implement proxy/preview mode: lower resolution during editing, full resolution on export
- Consider skipping real-time multi-track preview for MVP if time-constrained

#### 3. Screen Recording API Complexity

**Risk:** Screen capture requires platform-specific permissions and APIs. Different behavior on Mac vs Windows.

**Mitigation:**
- Use Electron's desktopCapturer API (abstracts platform differences)
- Implement graceful failure with clear error messages
- Make recording a post-MVP feature (not required for Tuesday deadline)
- Test on target OS early to catch permission issues

#### 4. Timeline UI Responsiveness

**Risk:** Timeline with many clips can become sluggish with DOM-based rendering. Drag-and-drop may lag.

**Mitigation:**
- Start with DOM-based timeline for faster development
- Optimize renders with React.memo and proper key usage
- If performance issues arise: migrate to Canvas-based timeline
- Use virtualization for clip thumbnails (only render visible clips)

#### 5. Cross-Platform Packaging

**Risk:** Different packaging requirements for Mac (.dmg, code signing) vs Windows (.exe) can consume significant time.

**Mitigation:**
- Focus on single platform initially (develop on your primary OS)
- Use electron-builder with basic configuration
- Skip code signing for initial submission (can add later)
- Test packaging on Day 2 to avoid last-minute surprises

---

## Key Trade-off Decisions

### Trade-off 1: Real-time Preview vs Development Speed

#### Option A: Full real-time multi-track preview
- **Pros:** Better UX, users see final result immediately
- **Cons:** Complex implementation, CPU intensive, high risk for timeline

#### Option B: Single-track preview with "Render Preview" button for multi-track
- **Pros:** Faster to implement, more reliable, acceptable UX
- **Cons:** Not real-time, adds user step

**Recommendation:** Option B for MVP. Add real-time preview post-submission if time allows.

### Trade-off 2: Native FFmpeg vs WebAssembly FFmpeg

#### Option A: Native FFmpeg binary (fluent-ffmpeg in main process)
- **Pros:** Faster processing, full feature set, battle-tested
- **Cons:** Larger bundle size, platform-specific binaries

#### Option B: @ffmpeg/ffmpeg (WebAssembly in renderer)
- **Pros:** Cross-platform, easier to integrate
- **Cons:** Slower, limited feature set, potential CORS issues

**Recommendation:** Option A (Native FFmpeg). Performance is critical for video processing.

### Trade-off 3: Feature Breadth vs Depth

#### Option A: Many features with basic implementation
- **Pros:** Impressive demo, shows ambition
- **Cons:** Higher risk of bugs, shallow implementation, fragile system

#### Option B: Core features with solid, polished implementation
- **Pros:** Reliable, professional feel, easier to debug
- **Cons:** May seem less impressive in demos

**Recommendation:** Option B. A working video editor that reliably imports, edits, and exports beats a feature-rich app that crashes.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| App launch time | Under 5 seconds |
| Timeline responsiveness (10+ clips) | No lag when dragging or scrubbing |
| Preview playback frame rate | Minimum 30 fps |
| Export success rate | 100% (no crashes) |
| Memory usage during 15min session | Stable (no significant leaks) |
| Exported video quality | Visually lossless, reasonable file size |

---

## Testing Strategy

### Critical Test Scenarios

- **Import test:** Drag & drop 3 MP4 files of different resolutions. Verify all appear in media library.
- **Timeline test:** Add clips to timeline, reorder them, verify sequence in preview.
- **Trim test:** Set in/out points on clip, verify exported video reflects trim.
- **Export test:** Export 2-minute video with multiple clips. Verify playback in VLC and QuickTime.
- **Recording test:** Record 30-second screen capture with audio, verify saved to timeline.
- **Multi-track test:** Overlay webcam on screen recording, verify PiP positioning in export.
- **Stress test:** Edit session with 15 clips, 10 cuts, verify no memory leaks or crashes.

---

## Success Metrics

### MVP Success Criteria
- Application launches and displays UI within 5 seconds
- User can import, trim, and export a single MP4 file
- Exported video plays correctly in standard media players
- Application is packaged as installable binary (not just dev mode)

### Full Product Success Criteria
- All MVP criteria met plus recording functionality working
- User can record screen or webcam and add to timeline
- Timeline supports drag-and-drop arrangement of multiple clips
- Multi-track composition (PiP overlay) works in export
- No crashes during 15-minute editing session
- Demo video showcases complete workflow: record → import → edit → export
- Clear README with setup instructions

---

## Implementation Roadmap

### Day 1 (Monday) - Foundation & MVP Core

#### Hours 1-4: Project Setup
- Initialize Electron + React + TypeScript project
- Setup electron-builder configuration
- Install and test FFmpeg integration
- Create basic app shell with main/renderer IPC

#### Hours 5-12: Import & Preview
- Implement file picker and drag-drop for video import
- Build video preview player with HTML5 video element
- Extract and display video metadata (duration, resolution)
- Test with multiple video formats and sizes

### Day 2 (Tuesday) - MVP Completion

#### Hours 1-6: Timeline & Trim
- Build basic timeline UI showing clip duration
- Implement trim controls (set in/out points)
- Update preview to reflect trim markers
- Add basic playhead scrubbing

#### Hours 7-12: Export & Packaging
- Implement FFmpeg export for single clip
- Add progress indicator for export process
- Build and package application with electron-builder
- Test packaged app on clean system
- **SUBMIT MVP BY 10:59 PM CT**

### Day 3 (Wednesday) - Full Features

#### Hours 1-6: Multi-clip Timeline
- Enhance timeline to support multiple clips in sequence
- Implement drag-and-drop reordering
- Add clip splitting at playhead
- Update FFmpeg export to stitch multiple clips
- Test export with 5+ clip sequence

#### Hours 7-12: Recording Features
- Implement screen recording with desktopCapturer
- Add webcam recording with getUserMedia
- Save recordings and add to timeline automatically
- Test simultaneous screen + webcam recording

#### Hours 13-16: Multi-track & Polish
- Add second track to timeline for overlay/PiP
- Update FFmpeg export with overlay compositing
- Final bug fixes and UX polish
- Record demo video
- Update README with setup instructions
- **SUBMIT FULL APP BY 10:59 PM CT**

---

## Final Recommendations

- **Prioritize ruthlessly:** Focus on core loop (import → edit → export). Defer all non-essential features.
- **Test packaging early:** Build distributable on Day 2 morning, not last minute.
- **Validate FFmpeg first:** Get a simple clip export working on Day 1 to derisk video processing.
- **Keep it simple:** DOM-based timeline, single-track preview, basic export. Polish after core works.
- **Document as you go:** Update README incrementally, don't leave it for the end.
- **Have a backup plan:** If recording proves too difficult, focus on making editing/export bulletproof.

---

## Remember

**A simple, working video editor beats a feature-rich app that crashes.**

Focus on the core loop: **Record → Import → Arrange → Export**

Desktop apps are hard. Video processing is hard. You're doing both in 3 days.

**Just submit. Don't miss a submission.**
