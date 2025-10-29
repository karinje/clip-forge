import React, { useState, useEffect } from 'react';
import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
import { PreviewPlayer } from './components/PreviewPlayer/PreviewPlayer';
import { Timeline } from './components/Timeline/Timeline';
import { ExportDialog } from './components/ExportDialog/ExportDialog';
import { useVideoExport } from './hooks/useVideoExport';
import './styles/index.css';

export const App: React.FC = () => {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const { exportVideo, isExporting, progress, error } = useVideoExport();
  
  // Clear old localStorage once (version mismatch workaround)
  useEffect(() => {
    const hasCleared = localStorage.getItem('clipforge-cleared-v3');
    if (!hasCleared) {
      console.log('[App] Clearing old localStorage (one-time cleanup)');
      localStorage.removeItem('clipforge-timeline');
      localStorage.removeItem('clipforge-project');
      localStorage.setItem('clipforge-cleared-v3', 'true');
    }
  }, []);
  
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
      <div className="sidebar">
        <MediaLibrary />
      </div>
      <div className="main">
        <PreviewPlayer />
        <Timeline onExportClick={handleExportClick} />
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

