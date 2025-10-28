# ClipForge Mermaid Diagrams

This package contains 8 comprehensive mermaid diagrams for the ClipForge project.

## 📊 Diagram Files

### 1. Architecture (`01_architecture.mermaid`)
**System Architecture Overview**
- Shows the complete Electron app structure
- Renderer Process (React UI components)
- Main Process (Node.js services and handlers)
- Preload Bridge (IPC security layer)
- System Resources (FFmpeg, File System, Camera/Screen)
- State Management (Zustand stores)

### 2. Timeline (`02_timeline.mermaid`)
**72-Hour Development Timeline**
- Gantt chart spanning 3 days
- Day 1: Foundation (PR-00 to PR-03)
- Day 2: MVP completion (PR-04 to PR-07) - **Tuesday 10:59 PM deadline**
- Day 3: Full features (PR-08 to PR-15) - **Wednesday 10:59 PM deadline**
- All 15+ pull requests mapped with time estimates

### 3. Workflow (`03_workflow.mermaid`)
**Core User Workflow**
- Import Phase: Drag & drop, file picker, recording
- Edit Phase: Timeline arrangement, trimming, splitting
- Preview Phase: Playback controls and scrubbing
- Export Phase: Resolution selection and FFmpeg processing
- Complete user journey from start to finish

### 4. Tech Stack (`04_tech_stack.mermaid`)
**Technology Stack by Layer**
- Frontend Layer: React 18, TypeScript, Zustand, HTML5
- Desktop Layer: Electron 28+, IPC, Node.js
- Processing Layer: FFmpeg, fluent-ffmpeg, MediaRecorder
- Build & Package: Webpack, Electron Forge, electron-builder

### 5. Data Flow (`05_data_flow.mermaid`)
**Sequence Diagram: Import to Export**
- User interactions
- IPC communication flow
- FFmpeg processing steps
- State management updates
- Progress tracking
- Complete data flow from video import through export

### 6. Components (`06_components.mermaid`)
**React Component Hierarchy**
- App root structure
- Layout components (Toolbar, StatusBar)
- Main work area (Media Library, Preview, Timeline)
- Timeline sub-components (Ruler, Tracks, Clips, Playhead)
- Dialog components (Export, Recording)

### 7. MVP vs Full (`07_mvp_vs_full.mermaid`)
**Feature Comparison**
- MVP Features (Tuesday deadline): 7 core features
- Full Features (Wednesday deadline):
  - Recording capabilities
  - Advanced editing features
  - Enhanced export options
- Clear visual separation of what's needed when

### 8. Risks (`08_risks.mermaid`)
**Risk Mitigation Strategy**
- 5 key risks identified
- Mitigation strategies for each
- FFmpeg integration
- Timeline performance
- Screen recording platform differences
- Multi-track preview performance
- Packaging complexity

## 🎨 How to View These Diagrams

### Option 1: GitHub (Recommended)
Just push these `.mermaid` files to your GitHub repository. GitHub automatically renders mermaid diagrams!

### Option 2: Mermaid Live Editor
1. Go to https://mermaid.live
2. Paste the content of any `.mermaid` file
3. View and export as SVG or PNG

### Option 3: VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Create a markdown file with mermaid code blocks:
   ```markdown
   ```mermaid
   [paste diagram content here]
   ```
   ```
3. Use markdown preview (Cmd+Shift+V or Ctrl+Shift+V)

### Option 4: Markdown Files
Most markdown viewers support mermaid. Wrap diagram content in code blocks:
\`\`\`mermaid
[diagram content]
\`\`\`

## 📝 Usage in Documentation

### In README.md
```markdown
## Architecture
```mermaid
[paste 01_architecture.mermaid content]
```

## Timeline
```mermaid
[paste 02_timeline.mermaid content]
```
```

### In Technical Documentation
Include specific diagrams where relevant:
- Architecture diagram in technical design docs
- Timeline in project planning docs
- Component hierarchy in developer onboarding
- Data flow in API documentation

## 🔄 Updating Diagrams

All diagrams are plain text, making them easy to version control and update:

1. Edit the `.mermaid` file
2. Test in Mermaid Live Editor
3. Commit changes
4. GitHub will automatically render the updated version

## 📦 Integration Tips

### For Project README
Include the architecture and workflow diagrams to give quick overview

### For Developer Onboarding
Use component hierarchy and data flow diagrams

### For Project Management
Timeline and MVP vs Full diagrams for tracking progress

### For Stakeholder Updates
Workflow and timeline diagrams show user journey and progress

## 🎯 Key Insights from Diagrams

1. **Critical Path**: MVP must be complete by Tuesday 10:59 PM
2. **Architecture**: Clean separation between Renderer, Main, and Preload
3. **Risk Areas**: FFmpeg integration, timeline performance, screen recording
4. **Tech Stack**: Modern, battle-tested technologies (React, Electron, FFmpeg)
5. **Workflow**: Four clear phases - Import → Edit → Preview → Export

## 📚 Related Documents

- `ClipForge_PRD.md` - Full product requirements
- `ClipForge_Task_Breakdown.md` - Detailed task breakdown with 16 PRs
- These diagrams - Visual representation of the above

---

**Note**: These diagrams are living documents. Update them as the project evolves to keep documentation in sync with implementation.
