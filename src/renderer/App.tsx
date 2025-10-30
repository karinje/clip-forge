import React, { useState, useEffect } from 'react';
import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
import { PreviewPlayer } from './components/PreviewPlayer/PreviewPlayer';
import { Timeline } from './components/Timeline/Timeline';
import { ExportDialog } from './components/ExportDialog/ExportDialog';
import { RecordingPanel } from './components/RecordingPanel/RecordingPanel';
import { useVideoExport } from './hooks/useVideoExport';
import './styles/index.css';

export const App: React.FC = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { exportVideo, isExporting, progress, error } = useVideoExport();
  
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
        <button className="header-button primary" onClick={handleExportClick}>
          Export Video
        </button>
      </header>
      
      <div className="app-workspace">
        <div className="sidebar">
          <MediaLibrary />
        </div>
        <div className="main">
          <PreviewPlayer />
          <Timeline onExportClick={handleExportClick} />
        </div>
      </div>
      
      {showExportDialog && (
        <ExportDialog
          onClose={() => setShowExportDialog(false)}
          onExport={handleExport}
          isExporting={isExporting}
          progress={progress}
          error={error}
        />
      )}
    </div>
  );
};

