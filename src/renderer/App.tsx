import React, { useState, useEffect, useRef } from 'react';
import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
import { PreviewPlayer } from './components/PreviewPlayer/PreviewPlayer';
import { Timeline } from './components/Timeline/Timeline';
import { ExportDialog } from './components/ExportDialog/ExportDialog';
import { RecordingPanel } from './components/RecordingPanel/RecordingPanel';
import { ShortcutHelpModal } from './components/ShortcutHelpModal/ShortcutHelpModal';
import { StatusBar } from './components/StatusBar/StatusBar';
import { useVideoExport } from './hooks/useVideoExport';
import './styles/index.css';

export const App: React.FC = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [previewHeight, setPreviewHeight] = useState(400);
  const { exportVideo, isExporting, progress, error } = useVideoExport();
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
    </div>
  );
};

