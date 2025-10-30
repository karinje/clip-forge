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
5. Preview seek bar remains aligned with the selected clip’s boundaries while trimming
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

### Audio Overlay & Mixing

1. Import MP3 and other audio files (mp3, wav, aac, m4a, flac, ogg)
2. Audio-only extraction from video clips (use audio without video)
3. Volume control per track (0-200% with visual slider)
4. Mix multiple audio tracks (main video + overlay audio)
5. Background music support with adjustable volume
6. Automatic audio stream detection and mixing in export

### Export & Sharing

1. Export timeline to MP4
2. Resolution options (720p, 1080p, source resolution)
3. Progress indicator during export
4. Save to local file system
5. Audio mixing with volume adjustments
6. Scrollable export modal with always-visible controls

### Stretch Goals (If Time Permits)

1. ⏳ Camera + Screen recording (PiP) with live preview - Partially implemented (screen and webcam separate)
2. ⏳ Video speed adjustment (slow motion, fast forward) - Pending
3. ⏳ Text overlays with custom fonts - Pending
4. ⏳ Transitions between clips (fade, slide) - Pending
5. ⏳ Audio fade in/out effects - Pending
6. ⏳ Filters and effects (brightness, contrast, saturation) - Pending
7. ⏳ Export presets (YouTube, Instagram, TikTok) - Pending
8. ⏳ Auto-save project state - Pending
9. ⏳ Undo/redo functionality - Pending

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

#### US-FULL-06: Audio Overlay & Mixing

**As a** content creator, **I want to** add background music to my videos with adjustable volume, **so that** I can enhance the viewing experience without overpowering my narration.

**Acceptance Criteria:**
- User can import MP3 and other audio files
- Audio files appear in media library with duration/metadata
- User can add audio to overlay tracks
- User can toggle "audio only" mode to use audio without video from video files
- Volume slider adjusts audio level per track (0-200%)
- Export correctly mixes main video audio with overlay audio tracks
- Volume adjustments are applied in final export

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

### Upgrade Strategy: Trim Handle UX

- Current behaviour keeps the preview seek label anchored to the clip's in-point for stability across multi-clip timelines.
- Next iteration should track which trim handle is active so dragging the out-point pins the label to the combined out-point, while dragging the in-point keeps it at the clip start.
- Store-level metadata (e.g. `activeTrimHandle`) will unblock keyboard nudges, snapping, and richer visual feedback without rewriting the trimming flow.

---

## Simplified Preview & Playback Model (October 29, 2025)

### The Loom Model: Timeline as Immutable Sequence

**Core Principle**: Timeline represents the FULL LENGTH of all clips laid out sequentially. Trim handles mark sections to SKIP during playback, but never change clip positions or total timeline duration.

#### Example Timeline:
```
Clip 1: 10s original (trim 2s start, 3s end → 5s playable)
Clip 2: 8s original (no trim → 8s playable)
Total Timeline: 18s (always, regardless of trimming)

Timeline visualization:
[0---2-TRIMMED-2--7-PLAY-7---10-TRIMMED-10][10-------18-PLAY-------18]
 Clip 1 (10s total)                          Clip 2 (8s total)
```

### 1. Timeline Positioning Rules

- **Clip positions calculated from originalDuration ONLY**
  - Clip N starts at: sum of all previous clips' `originalDuration`
  - Example: Clip 2 always starts at 10s, even if Clip 1 is trimmed to 5s playable
  
- **Trim changes NEVER reposition clips**
  - Adjusting trim handles only updates trim metadata
  - All clips stay in same timeline positions
  - Total timeline duration never changes

- **Data structure maintains both durations**
  - `originalDuration`: full clip length (immutable after import)
  - `duration`: playable length after trimming (for export calculations)
  - `trimStart`, `trimEnd`: trim amounts in seconds
  - `startTime`: position on timeline (from originalDuration sum)

### 2. Trim as Skip Markers

- **Trim regions are "holes" in the timeline**
  - Playhead can be positioned in trimmed areas (via timeline click)
  - But playback automatically skips over them
  
- **Real-time trim updates during playback**
  - If playing and user drags trim handle, playback logic instantly reflects change
  - Example: Playing at 7.5s in Clip 1, user moves end trim from 3s to 4s
    - Clip 1 playable region shrinks from 2-7s to 2-6s
    - Playhead at 7.5s is now in trimmed region
    - Playback immediately jumps to Clip 2 at 10s
  
- **Trim handles update in data structure immediately**
  - Store: `trimStart`, `trimEnd` updated on drag
  - Playback logic queries current trim values each frame
  - No need to wait for drag completion

### 3. Playhead Synchronization Model

**Single Source of Truth**: There is only ONE playhead position that represents both:
- Where we are in the timeline (in seconds from start)
- Which video frame is displayed in the player

**Playhead is ALWAYS synced with the displayed video frame:**
- During playback: video plays → playhead updates to match
- Manual positioning: playhead moved (timeline click) → video seeks to match
- **Playback state is preserved**: If playing when timeline clicked → continues playing from new position
- No separate "internal" vs "external" playhead
- No delay between video position and playhead position

**Manual seek behavior**:
- User clicks timeline while video is paused → seeks to position, stays paused
- User clicks timeline while video is playing → seeks to position, **keeps playing**
- This applies to both same-clip seeks and cross-clip seeks
- Rationale: User expects continuous playback, not interruption from scrubbing

### 4. Playback Skip Logic

**Overview**: This section defines how the video player handles trimmed regions during all playback scenarios - pressing play from a paused state, dynamic trim changes during playback, and continuous multi-clip playback.

**Core Principles**:
1. **Never play trimmed content**: Trimmed regions are invisible to playback
2. **Always jump to start**: When skipping to next clip, go to its `trimStart` (never end)
3. **Preserve playback state**: If playing when trim forces jump, continue playing after jump
4. **Check trim first**: Detect trim status before updating playhead to prevent race conditions
5. **Real-time responsiveness**: Trim changes during playback take effect immediately

#### When Play is Pressed from Trimmed Region

**Example**: User clicks at 2s on timeline (in Clip 1's start trim), then presses play:
1. Playhead is at 2s (in trimmed region before 2.5s trimStart)
2. User presses play
3. **Immediately** jump:
   - Playhead moves to 2.5s (first non-trimmed position)
   - Video seeks to show frame at 2.5s
4. Start playing from 2.5s

**Example 2**: User clicks at 8s on timeline (in Clip 1's end trim), then presses play:
1. Playhead at 8s (in trimmed region after 7.5s playable end)
2. User presses play  
3. **Immediately** jump:
   - Playhead moves to 10.5s (Clip 2 start + its trimStart of 0.5s)
   - Video switches to Clip 2 and shows frame at 0.5s
4. Start playing from Clip 2

**Key**: No playing through trimmed regions. Instant jump on play press.

#### During Playback
- Video plays normally
- Each video frame update:
  - Update playhead to: `clipStart + video.currentTime`
  - Check if video.currentTime is in trimmed region:
    - Before `trimStart`: jump video to `trimStart`, update playhead
    - After `originalDuration - trimEnd`: advance to next clip, update playhead
  - Playhead and video stay perfectly synced

#### Trim Boundary Detection
For clip at position `clipStart` with `trimStart` and `trimEnd`:
- Trimmed region 1 (start): `[clipStart, clipStart + trimStart)`
- Playable region: `[clipStart + trimStart, clipStart + originalDuration - trimEnd)`
- Trimmed region 2 (end): `[clipStart + originalDuration - trimEnd, clipStart + originalDuration)`

#### Auto-Advance Behavior
When video reaches end of playable region **during playback**:
1. Detect end of playable section
2. Calculate next clip's playable start: `nextClipStart + nextClip.trimStart`
3. Jump playhead to that position
4. Switch to next clip video
5. **Continue playing** - do NOT pause

**Critical**: If playing through multiple clips, playback should be continuous. Only pause when:
- User presses pause
- Reaches end of timeline (no more clips)
- User clicks timeline (explicit seek)

**Known limitation**: Brief gap (~100-300ms) when switching between clips due to video element reload. This is inherent to web-based video playback:
- Browser must load new video metadata
- Decode first frames of next clip
- Cannot be eliminated without complex MediaSource API or WebCodecs
- Professional web editors (CapCut, Descript, Clipchamp) have same limitation
(Optimized preload helps but cannot eliminate entirely)

**Key Point**: Playhead and video frame are ALWAYS in sync. The playhead position in seconds directly corresponds to the frame being displayed.

### 4.1 Dynamic Trimming Behavior

**Scenario 1: Trimming while paused**
- User trims a clip while video is paused
- Playhead may now be in a trimmed region
- When user presses play:
  - If in start trim → jump to `trimStart` of current clip, then play
  - If in end trim → jump to `trimStart` of next clip, then play (or do nothing if no next clip)
  - Playback MUST start, not remain paused

**Scenario 2: Trimming during playback (critical edge case)**
- User moves end trim handle of currently playing clip WHILE playhead is progressing
- Example: Playhead at 5s of 10s clip, user drags end trim to 4s
- Expected behavior:
  1. Video detects playhead is now in trimmed region (5s > 4s playable)
  2. Immediately jumps to START (`trimStart`) of next clip on same track
  3. Continues playing seamlessly (no pause)
  4. Never jumps to end of next clip (always start)
- Implementation requirement:
  - Check trim status BEFORE updating playhead position in `timeupdate` handler
  - This prevents race condition where playhead update triggers external sync effect
  - Only update playhead position if in valid (non-trimmed) region

**Scenario 3: Auto-advancing at clip end**
- Playhead reaches end trim of current clip during playback
- Next clip exists on same track
- Expected behavior:
  1. Capture current playing state: `resumePlaybackRef = isPlaying` 
     - **CRITICAL**: Use `isPlaying` state, NOT `!video.paused`
     - Browser may auto-pause video at clip end before timeupdate fires
     - `isPlaying` tracks intended state via play/pause events
  2. Load next clip at its `trimStart` position
  3. If `resumePlaybackRef` is true → auto-play immediately (no pause)
  4. If `resumePlaybackRef` is false → stay paused
- Critical: Playback state must be preserved across clip transitions

**Race condition prevention** (critical for avoiding infinite loops):

**Problem**: Three systems update playhead position:
1. `timeupdate` handler (4-10 Hz, for logic like trim detection)
2. `requestAnimationFrame` loop (60 Hz, for smooth visual updates)  
3. External sync effect (responds to manual timeline clicks)

During clip transitions, these can conflict and create infinite loops.

**Solution**: Use `pendingSeekRef` as a "transition in progress" flag:

```
Auto-advance sequence:
1. timeupdate detects end trim
2. Sets pendingSeekRef = nextClip.trimStart (LOCK)
3. Sets resumePlaybackRef = wasPlaying (`resumePlaybackRef.current || !video.paused || isPlaying`)
4. Immediately sets playheadPosition to next clip’s playable start
5. Switches clip (setCurrentClipIndex, setVideoKey)
6. RAF loop checks pendingSeekRef → skips playhead update
7. External sync checks pendingSeekRef → skips interference
8. Video loads, applies pendingSeek, clears it (UNLOCK)
9. Normal playback resumes

Manual clip switch sequence:
1. User clicks timeline on different clip
2. External sync detects targetClipIndex !== currentClipIndex
3. Calculates offsetInTargetClip = playheadPosition - targetClip.startTime
4. Sets pendingSeekRef = offsetInTargetClip (LOCK - prevents RAF corruption)
5. Sets resumePlaybackRef = isPlaying (preserve playback state)
6. Switches clip (setCurrentClipIndex, setVideoKey)
7. Video loads, applies pendingSeek to exact clicked position
8. Continues playing if was playing, stays paused if was paused

timeupdate handler order:
1. Check if pendingSeekRef exists → skip if true
1a. Check if atEndOfTimelineRef is true → skip (prevents repeated stop logic)
2. Check trim status FIRST (before any playhead updates)
3. If in trim region → handle jump/advance → return early
4. Only if valid region → update playhead position

RAF loop order:
1. Check if pendingSeekRef exists → skip playhead update, continue loop
2. Calculate playhead position = clipStart + video.currentTime
3. **Clamp to trim boundaries**: playhead must stay within [clipStart + trimStart, clipStart + (originalDuration - trimEnd)]
4. Update playhead position with clamped value

**Critical**: Clamping prevents visual overshoot. Without it, RAF updates playhead past trim boundary before timeupdate detects it, causing playhead to appear outside trim handles.

When stopping at final clip end:
- Clamp video.currentTime to the playable end (`originalDuration - trimEnd`)
- Set playheadPosition = `clip.startTime + playableEnd`
- Set `atEndOfTimelineRef = true` so subsequent timeupdate/RAF cycles exit early

External sync order:
1. Check if pendingSeekRef exists → return early (don't interfere)
2. Check if atEndOfTimelineRef is true → return early (don't interfere with pause state)
3. If playhead is outside playable region (in trim) → return early (let timeupdate handle skip)
3. Find which clip contains playhead position
4. Switch clip if needed, or seek within same clip
```

This ensures no system interferes during clip transitions.

**End-of-timeline flag (`atEndOfTimelineRef`)**:
- Set to `true` when playback reaches end and pauses
- Prevents external sync effect from reloading video (which corrupts play/pause button state)
- Also forces the play/pause button to show **play** even if a stray `play` event fires
- Cleared when:
  - User clicks play/pause button
  - Auto-advancing to next clip
  - Playing normally in non-trimmed region
- Critical for maintaining correct button state at end of timeline

### 4.2 Play/Pause Button State

**Critical requirement**: Button icon must ALWAYS reflect the opposite of current playback state:
- Video is playing → Button shows **PAUSE** icon
- Video is paused → Button shows **PLAY** icon

**Implementation**:
- Button state driven by video element events: `play`, `pause`, `ended`
- `useVideoPlayer` hook listens to these events and updates `isPlaying` state
- State updates happen automatically, not manually

**Edge cases requiring correct button state**:
1. **End of timeline**: Playhead reaches end → video auto-pauses → button shows "play"
2. **Manual pause**: User clicks pause → video pauses → button shows "play"
3. **Trim jump while paused**: User in trim region, presses play → video plays → button shows "pause"
4. **Trim jump during playback**: Video auto-advances to next clip → continues playing → button stays "pause"
5. **Manual timeline click**: User clicks timeline → video pauses for seek → button shows "play" (if was paused)

**Never manually set playing state** - always let video events drive the state.

### 4.2.1 End-of-Timeline Behavior

When playback reaches the end of the final clip:
- Video pauses automatically and emits the native `pause` event
- Play/pause button switches to the **play** icon immediately
- Playhead remains at the end-of-timeline position (no rewind)
- Pressing play at the end rewinds to the first segment’s `trimStart` and restarts playback
- Manual repositioning is still supported (e.g., clicking the timeline will jump to that position and continue playing if active)

**Goal**: Button state always reflects the fact that playback is paused, without forcing an automatic restart.

### 4.3 Comprehensive Behavior Summary

**Golden Rules**:
1. **Timeline = source of truth**: All clips positioned by `originalDuration`, trims are skip markers
2. **Playhead = current position**: Always synced with video frame, measured in timeline seconds
3. **Trim = skip region**: Defines what to skip during playback/export, doesn't change clip position
4. **Check trim first**: In `timeupdate`, check trim status before updating playhead (prevents race conditions)
5. **Preserve playback state**: When auto-advancing, capture `wasPlaying` and restore it
6. **Jump to start**: Always jump to `trimStart` of target clip, never end
7. **Button follows video**: Play/pause button state driven by video events, never manual

**Complete playback flow example**:
```
Timeline: [Clip A: 0-10s, trimEnd=2s] [Clip B: 10-20s, trimStart=1s, trimEnd=3s] [Clip C: 20-30s]

User presses play at 0s:
→ Plays 0s-8s of Clip A (stops at trimEnd: 10s - 2s = 8s)
→ timeupdate detects inEndTrim at 8s
→ Captures wasPlaying=true, sets resumePlaybackRef=true
→ Auto-advances to Clip B at trimStart (11s on timeline, 1s in video)
→ Loads Clip B, sees resumePlaybackRef=true → auto-plays
→ Plays 11s-17s timeline (1s-7s video, stops at trimEnd: 10s - 3s = 7s)
→ Auto-advances to Clip C at 20s
→ Plays 20s-30s (entire Clip C, no trims)
→ Reaches end → video.pause() → button shows "play"

User drags Clip B end trim from 3s to 5s WHILE playing at 16s timeline (6s video):
→ timeupdate fires, detects 6s >= (10s - 5s) → inEndTrim=true
→ Immediately jumps to Clip C at 20s (trimStart)
→ Continues playing seamlessly (button stays "pause")
→ No gap, no pause, no confusion
```

**Bug fixes applied**:
- ✅ Fixed: Pausing after trim jump (now preserves playing state with `wasPlaying`)
- ✅ Fixed: Wrong jump position during playback (check trim BEFORE playhead update)
- ✅ Fixed: Play button not updating (driven by video events: play/pause/ended)

### 4.4 Test Scenarios (Verification Checklist)

**Test 1: Trim while paused, then play**
1. Load 2 clips into timeline
2. Pause at 3s of first clip
3. Drag end trim of first clip to 2s (playhead now in trimmed region)
4. Press play
- ✅ Expected: Immediately jumps to start of second clip and plays (no pause)
- ❌ Bug: Would pause at second clip instead of playing

**Test 2: Trim while playing**
1. Load 2 clips (each 10s) into timeline
2. Play from beginning
3. When playhead at 6s of first clip, drag end trim to 5s
4. Video should immediately jump to 10s timeline (start of second clip)
- ✅ Expected: Jumps to second clip start (10s), continues playing smoothly
- ❌ Bug: Would jump to wrong position or get stuck in loop

**Test 3: Multi-clip continuous playback**
1. Load 3 clips into timeline
2. Press play from beginning
3. Watch playback progress through all clips
- ✅ Expected: Plays clip 1 → auto-advances → plays clip 2 → auto-advances → plays clip 3 → pauses
- ❌ Bug: Would pause between clips

**Test 4: Button state at end of timeline**
1. Load clips, play through to end
2. Observe button when playhead reaches end
- ✅ Expected: Button changes to "play" icon
- ❌ Bug: Button stuck showing "pause"

**Test 5: Smooth playhead movement**
1. Load clips, press play
2. Observe playhead visual movement
- ✅ Expected: Smooth 60fps progression (requestAnimationFrame)
- ❌ Bug: Jumpy/choppy movement (only timeupdate events)

**Test 6: Press play from trimmed region**
1. Load clip with end trim of 3s
2. Click timeline at 8s (within trim region)
3. Press play
- ✅ Expected: Jumps to next clip start and plays (or stays paused if no next clip)
- ❌ Bug: Plays trimmed section or does nothing

**Test 7: Click different clip during playback**
1. Load 2 clips (each 10s) into timeline
2. Play from beginning (playhead in clip 1 at 3s)
3. Click timeline at 15s (5s into clip 2)
4. Observe where video seeks to
- ✅ Expected: Jumps to exactly 5s into clip 2, continues playing
- ❌ Bug: Jumps to wrong position in clip 2 (RAF corrupted playheadPosition)

**Test 8: Restart from end**
1. Load clips, play through to end
2. Observe button state when playback stops
3. Click play button
- ✅ Expected: Button shows "play" at end, clicking restarts from beginning
- ❌ Bug: Button stuck as "pause", or clicking play does nothing

**Test 9: Playhead stops exactly at trim boundaries**
1. Load clip with end trim set (e.g., trim 2s from 10s clip)
2. Play clip and watch playhead reach end trim
3. Observe exact position where playhead stops
- ✅ Expected: Playhead stops exactly at trim handle position (8s), not past it
- ❌ Bug: Playhead overshoots past trim boundary visually (appears at 8.1s or beyond)

**Test 10: Button state with multiple clips at end**
1. Load 2 clips into timeline (no trims)
2. Play from beginning through both clips to end
3. Observe play/pause button state when playback stops
4. Click play button
- ✅ Expected: Button shows "play" when stopped at end, clicking restarts from beginning
- ❌ Bug: Button stuck showing "pause" at end (external sync interference)

### 5. Video Player Simplification

- **No scrubber** - Timeline is the scrubber
- **Display only**: `playheadPosition / totalOriginalDuration` (e.g., `5:30 / 18:00`)
- **Frame display**: Always shows frame at playhead position
  - Playhead at 3.5s → video shows frame at 3.5s
  - Even if 3.5s is in trimmed region, that frame is visible (just won't play through it)
  - Perfect sync: playhead position = video frame position
- **Session storage**: Only media metadata and timeline clip configuration (position, trims, track info) persist between launches; playhead state is always reset to the first segment’s `trimStart` when the app starts

### 6. Implementation Checklist

- [x] Timeline store uses `originalDuration` for `startTime` calculations
- [x] `addClipToTimeline`: position = sum of previous clips' `originalDuration`
- [x] `updateClipTrim`: only updates `trimStart`, `trimEnd`, `duration` - never touches `startTime`
- [x] `removeClipFromTimeline`: recalculates positions using `originalDuration`
- [x] Playback timeupdate: checks if playhead in trimmed region each frame
- [x] Auto-skip logic: jumps playhead to next non-trimmed section
- [x] Trim handle drag: immediately updates store, playback responds in real-time
- [x] Timeline click: can position playhead anywhere (including trimmed regions)
- [ ] Export: only includes non-trimmed segments in output (already working, verify)

### Rationale

- **Predictable**: Clip positions never change, making timeline stable
- **Real-time**: Trim changes instantly affect playback without recalculation
- **Simple mental model**: Timeline = full sequence, trims = skip markers
- **Eliminates edge cases**: No need to handle clip repositioning on every trim change
- **Matches user expectations**: Like Loom - trim doesn't move clips around

---

## Advanced Editing Features (October 30, 2025)

### Split Clip (Loom Model Implementation)

**Behavior**: When splitting a clip at the playhead, BOTH resulting clips:
- Stay at the SAME timeline position
- Keep the SAME `originalDuration`
- Use `trimStart`/`trimEnd` to control which half is visible

**Example**: 10-second clip split at 6s:
- Clip A: `startTime=0`, `originalDuration=10`, `trimStart=0`, `trimEnd=4` (shows 0-6s)
- Clip B: `startTime=0`, `originalDuration=10`, `trimStart=6`, `trimEnd=0` (shows 6-10s)

**Result**: Timeline length unchanged, clips visually appear as two separate segments

**Keyboard Shortcut**: `Cmd+K` / `Ctrl+K`

### Duplicate Clip

**Behavior**: Creates a copy of the selected clip and places it at the end of the same track

**Implementation**: New clip gets fresh ID, positioned after last clip on track using `originalDuration` sum

**Keyboard Shortcut**: `Cmd+D` / `Ctrl+D`

### Delete Trimmed Region (Inverse Trim)

**Behavior**: Deletes the visible (playable) portion of a clip, keeping only the trimmed segments as separate clips

**Example**: Clip with `trimStart=2s`, `trimEnd=3s` (from 10s original):
- Deleting trimmed region removes the 5s middle section
- Creates two new clips: one with first 2s, one with last 3s
- Timeline re-sequences to close the gap

**Use Case**: User marks unwanted section with trim handles, then Shift+Delete removes it

**Keyboard Shortcut**: `Shift+Delete`

### Loom-Style Timeline Toolbar

**Visual Controls** (left to right):
1. **Split Button** (✂️) - Splits selected clip at playhead
2. **Delete Button** (🗑️) - Removes selected clip entirely
3. **Duplicate Button** (📋) - Copies selected clip to end of track
4. **Zoom Out** (−) - Decreases timeline zoom by 30%
5. **Zoom to Fit** (⊡) - Fits entire timeline in viewport
6. **Zoom In** (+) - Increases timeline zoom by 30%

**Behavior**:
- Buttons disabled when no clip selected (except zoom)
- Tooltips show keyboard shortcuts
- Grouped with visual separators for clarity

### Timeline Zoom & Scroll

**Zoom Behavior**:
- Zoom range: 2-200 pixels per second
- Zoom persists in Zustand store
- Timeline width expands beyond viewport when zoomed in
- Horizontal scrollbar appears automatically

**Scrollbar Styling**:
- Custom styled to match dark theme
- 8px height, rounded thumb
- Hover effect for better visibility

### Keyboard Shortcuts Summary

| Shortcut | Action |
|----------|--------|
| `Space` | Play/pause video (works globally) |
| `Delete` or `Backspace` | Remove selected clip (or delete selected region) |
| `Shift+Delete` | Delete trimmed region, keep segments |
| `Cmd/Ctrl+K` | Split clip at playhead |
| `Cmd/Ctrl+D` | Duplicate selected clip |
| `Shift+← →` | Extend selection by 0.1s (hold Shift, press arrows) |
| `Cmd/Ctrl+Shift+S` | Toggle snap to grid/clips |
| `Cmd/Ctrl+E` | Open export dialog |
| `Cmd/Ctrl+?` | Show keyboard shortcuts help |
| `J` | Rewind 5 seconds |
| `L` | Fast forward 5 seconds |
| `[` | Jump to previous clip edge |
| `]` | Jump to next clip edge |
| `Escape` | Clear selection and anchor |
| Zoom controls | Via toolbar buttons (−, ⊡, +) |

### Shift+Arrow Selection & Deletion

**Behavior**: Intuitive region selection for precise editing:
1. Position playhead where selection should start
2. Hold `Shift` and press `←` or `→` to extend selection by 0.1s per press
3. Selection anchor automatically set on first Shift+Arrow press
4. Yellow highlight shows selected region (no labels, cleaner UI)
5. Press `Delete` to remove that region and create split clips

**Visual Indicators**:
- Yellow overlay between selection boundaries
- Yellow vertical lines at selection edges
- No labels (cleaner interface)
- Selected region deleted when Delete is pressed

**Escape Behavior**: Press `Escape` to clear selection and anchor

### Technical Implementation Notes

**Split Clip Fix**:
- Previous implementation changed `originalDuration` causing timeline expansion
- New implementation uses Loom model: both clips at same position with trim markers
- No re-sequencing needed, timeline length stays constant
- **Delete split clip fix**: Detects when deleting one of multiple split clips (same position, same originalDuration) and keeps siblings in place instead of re-sequencing the entire track

**Mixed Resolution Handling**:
- Already implemented in FFmpegService
- `scale` filter with `force_original_aspect_ratio=decrease`
- `pad` filter adds black bars to maintain aspect ratio
- All clips normalized to target resolution (720p/1080p)

**Progress Tracking**:
- Multi-clip exports show overall progress percentage
- Per-clip progress tracking available in FFmpeg service
- Could be enhanced with "Processing clip X of Y" messages

**Modern UI Icons**:
- Replaced emoji icons with clean SVG line icons
- Split (✂), Delete (trash), Duplicate (copy), Mute/Unmute, Close (X)
- Consistent stroke width and styling
- Icons scale properly at different sizes

**Solo Track Functionality** (Not yet implemented):
- When you "solo" a track, it mutes ALL other tracks
- Only the solo'd track plays audio/video
- Useful for multi-track editing to focus on one track at a time
- Click "solo" again to un-solo and restore other tracks
- Common in audio DAWs like Ableton, Pro Tools

**Timeline UI Improvements**:
- **Playhead Arrow Visibility**: Red triangle arrow positioned at 28px (after ruler) with proper z-index to remain visible above all timeline elements
- **Playhead Positioning**: Starts at top: 28px, extends through all visible tracks (+16px margin), no overlap with ruler
- **Vertically Centered Clips**: Clips centered in track with equal padding above and below for easier playhead positioning
- **Increased Track Height**: Tracks expanded to 110px height (from 90px) to provide more clickable area
- **Collapsible Sidebar**: Media library can be toggled to give more timeline space
- **Resizable Panels**: Drag borders between sidebar/main and timeline/preview to adjust layout
- **Modern Trim Handles**: Blue rounded handles (12px wide, 16px on hover) inside clips with white grip indicator
- **Prominent Playhead**: Red line (2px) with large triangle arrow (16px tall) for clear position marking
- **Tooltips on All Buttons**: Native browser tooltips via `title` attributes for all interactive elements
- **Shortcuts Button**: Keyboard icon button in timeline toolbar to quickly access shortcuts help modal
- **Cleaner Clip UI**: Removed X delete button from clips; use Delete key or toolbar button for keyboard-first workflow
- **Audio Controls**: Professional track-level controls for volume and audio-only mode with consistent styling
- **Selection Color**: Gray selection overlay (more natural for deletion marking than yellow)
- **Header Layout**: Logical workflow sequence - Record → Export Settings → Export Video → Reset
- **Export Settings Panel**: Dropdown panel with persistent settings (format, quality, duration mode, PiP position/scale)
- **Preview Composition**: Render full composition to temporary file for preview before final export

**Audio Features (October 30, 2025)**:
- **MP3/Audio Import**: Full support for importing audio files (mp3, wav, aac, m4a, flac, ogg)
- **Audio-Only Mode**: Toggle button to extract only audio from video clips on overlay tracks
- **Volume Control**: Per-track volume slider (0-200%) with percentage display
- **Audio Mixing**: FFmpeg-powered audio mixing with automatic stream detection
- **Mixed Scenarios**: Supports main video with/without audio + overlay audio in any combination
- **Export Modal**: Scrollable dialog (max-height 85vh) with fixed header/footer, always-visible export button
- **Professional UI**: Consistent transparent backgrounds, visual separators, hover effects

---

## Remember

**A simple, working video editor beats a feature-rich app that crashes.**

Focus on the core loop: **Record → Import → Arrange → Export**

Desktop apps are hard. Video processing is hard. You're doing both in 3 days.

**Just submit. Don't miss a submission.**
