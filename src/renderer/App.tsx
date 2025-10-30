import React, { useState, useEffect, useRef } from 'react';
import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
import { PreviewPlayer } from './components/PreviewPlayer/PreviewPlayer';
import { Timeline } from './components/Timeline/Timeline';
import { ExportDialog } from './components/ExportDialog/ExportDialog';
import { RecordingPanel } from './components/RecordingPanel/RecordingPanel';
import { ShortcutHelpModal } from './components/ShortcutHelpModal/ShortcutHelpModal';
import { PreviewCompositionModal } from './components/PreviewCompositionModal/PreviewCompositionModal';
import { StatusBar } from './components/StatusBar/StatusBar';
import { useVideoExport } from './hooks/useVideoExport';
import { useProjectStore } from './store/projectStore';
import { useTimelineStore } from './store/timelineStore';
import './styles/index.css';

export const App: React.FC = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPath, setPreviewPath] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [previewHeight, setPreviewHeight] = useState(400);
  const { exportVideo, isExporting, progress, error } = useVideoExport();
  const clips = useProjectStore(state => state.clips);
  const timelineClips = useTimelineStore(state => state.clips);
  const tracks = useTimelineStore(state => state.tracks);
  const playPauseHandlerRef = useRef<(() => void) | null>(null);
  const isDraggingSidebarRef = useRef(false);
  const isDraggingPreviewRef = useRef(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSidebarRef.current) {
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setSidebarWidth(newWidth);
      } else if (isDraggingPreviewRef.current) {
        const newHeight = Math.max(200, Math.min(800, e.clientY - 48)); // 48 = header height
        setPreviewHeight(newHeight);
      }
    };
    
    const handleMouseUp = () => {
      isDraggingSidebarRef.current = false;
      isDraggingPreviewRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + ? to show keyboard shortcuts help
      if ((e.metaKey || e.ctrlKey) && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setShowShortcutHelp(true);
      }
      // Cmd/Ctrl + E to open export dialog
      else if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setShowExportDialog(true);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  const handleReset = () => {
    // Clear all localStorage (cached state, settings, etc.)
    localStorage.clear();
    // Reload the app to start fresh
    window.location.reload();
  };
  
  const handleExportClick = () => {
    setShowExportDialog(true);
  };
  
  const handleExport = async (settings: any) => {
    const success = await exportVideo(settings);
    if (success) {
      setTimeout(() => {
        setShowExportDialog(false);
      }, 1000);
    }
  };
  
  const handlePreviewClick = async () => {
    setShowPreviewModal(true);
    setIsGeneratingPreview(true);
    setPreviewProgress(0);
    
    try {
      // Generate temp preview file
      const tempPath = `/tmp/clipforge-preview-${Date.now()}.mp4`;
      
      // Build export settings (use default quality and format)
      const hasMultipleTracks = tracks.length > 1 && tracks.some(t => 
        timelineClips.filter(c => c.trackId === t.id).length > 0
      );
      
      const settings = {
        format: 'mp4' as const,
        quality: 'high' as const,
        outputPath: tempPath,
        durationMode: 'main' as const,
        pipConfig: hasMultipleTracks ? {
          position: 'bottom-right' as const,
          scale: 0.25,
        } : undefined,
      };
      
      // Export to temp file
      const success = await exportVideo(settings);
      
      if (success) {
        setPreviewPath(tempPath);
        setIsGeneratingPreview(false);
      } else {
        // Close modal on error
        setShowPreviewModal(false);
        setIsGeneratingPreview(false);
      }
    } catch (err) {
      console.error('Preview generation failed:', err);
      setShowPreviewModal(false);
      setIsGeneratingPreview(false);
    }
  };
  
  const handleSavePreview = async () => {
    // Open save dialog
    const savePath = await window.electronAPI.saveFile('output.mp4');
    
    if (savePath && previewPath) {
      // Copy preview file to save location
      try {
        const copyResult = await window.electronAPI.copyFile(previewPath, savePath);
        
        if (copyResult.success) {
          // Delete temp preview
          await window.electronAPI.deleteFile(previewPath);
          
          // Close modal
          setShowPreviewModal(false);
          setPreviewPath('');
        } else {
          console.error('Failed to copy preview:', copyResult.error);
        }
      } catch (err) {
        console.error('Failed to save preview:', err);
      }
    }
  };
  
  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setPreviewPath('');
  };
  
  const startSidebarResize = () => {
    isDraggingSidebarRef.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };
  
  const startPreviewResize = () => {
    isDraggingPreviewRef.current = true;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">ClipForge</div>
        <div className="header-spacer"></div>
        <RecordingPanel />
        <button 
          className="header-button" 
          onClick={handleReset}
          title="Clear all clips and reset app state"
        >
          Reset
        </button>
        <button className="header-button primary" onClick={handleExportClick} title="Export timeline to video file">
          Export Video
        </button>
      </header>
      
      <div className="app-workspace">
        {!sidebarCollapsed && (
          <>
            <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
              <MediaLibrary />
            </div>
            <div 
              className="resize-handle resize-handle-vertical"
              onMouseDown={startSidebarResize}
              title="Drag to resize sidebar"
            />
          </>
        )}
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Show media library' : 'Hide media library'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarCollapsed ? (
              <path d="M15 18l-6-6 6-6"/>
            ) : (
              <path d="M9 18l6-6-6-6"/>
            )}
          </svg>
        </button>
        <div className="main">
          <div style={{ height: `${previewHeight}px`, flexShrink: 0 }}>
            <PreviewPlayer onPlayPauseHandlerReady={(handler) => { playPauseHandlerRef.current = handler; }} />
          </div>
          <div 
            className="resize-handle resize-handle-horizontal"
            onMouseDown={startPreviewResize}
            title="Drag to resize preview"
          />
          <Timeline 
            onExportClick={handleExportClick}
            onPreviewClick={handlePreviewClick}
            onShowShortcuts={() => setShowShortcutHelp(true)}
            playPauseHandler={playPauseHandlerRef} 
          />
        </div>
      </div>
      
      <StatusBar />
      
      {showExportDialog && (
        <ExportDialog
          onClose={() => setShowExportDialog(false)}
          onExport={handleExport}
          isExporting={isExporting}
          progress={progress}
          error={error}
        />
      )}
      
      {showShortcutHelp && (
        <ShortcutHelpModal onClose={() => setShowShortcutHelp(false)} />
      )}
      
      {showPreviewModal && (
        <PreviewCompositionModal
          isOpen={showPreviewModal}
          onClose={handleClosePreview}
          previewPath={previewPath}
          onSaveAs={handleSavePreview}
          isGenerating={isGeneratingPreview}
          progress={progress}
        />
      )}
    </div>
  );
};

