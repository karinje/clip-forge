import { useState, useEffect } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useProjectStore } from '../store/projectStore';
import { ExportSettings } from '../components/ExportDialog/ExportDialog';

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const clips = useTimelineStore(state => state.clips);
  const mediaClips = useProjectStore(state => state.clips);
  
  // Listen for progress updates from main process
  useEffect(() => {
    const handleProgress = (percent: number) => {
      setProgress(Math.min(Math.max(percent, 0), 100));
    };
    
    window.electronAPI.onMessage('export-progress', handleProgress);
    
    return () => {
      // Cleanup listener (note: electron doesn't provide easy removeListener via contextBridge)
    };
  }, []);
  
  const exportVideo = async (settings: ExportSettings) => {
    setIsExporting(true);
    setProgress(0);
    setError(null);
    
    try {
      // Build export data for each timeline clip
      const exportData = clips.map(clip => {
        const mediaClip = mediaClips.find(mc => mc.id === clip.mediaClipId);
        if (!mediaClip) {
          throw new Error(`Media clip not found: ${clip.mediaClipId}`);
        }
        
        return {
          filePath: mediaClip.filePath,
          trimStart: clip.trimStart,
          trimEnd: clip.trimEnd,
          duration: clip.duration,
        };
      });
      
      if (exportData.length === 0) {
        throw new Error('No clips to export');
      }
      
      // Single clip export (MVP)
      let result;
      
      if (exportData.length === 1) {
        const clip = exportData[0];
        
        result = await window.electronAPI.exportVideo({
          inputPath: clip.filePath,
          outputPath: settings.outputPath,
          trimStart: clip.trimStart,
          trimEnd: clip.trimEnd,
          format: settings.format,
          quality: settings.quality,
        });
      } else {
        // Multiple clips - concatenate
        result = await window.electronAPI.exportMultipleClips({
          clips: exportData,
          outputPath: settings.outputPath,
          format: settings.format,
          quality: settings.quality,
        });
      }
      
      if (result.success) {
        setProgress(100);
        setIsExporting(false);
        return true;
      } else {
        setError(result.error || 'Export failed');
        setIsExporting(false);
        return false;
      }
    } catch (err: any) {
      // Export failed
      setError(err.message || 'Export failed');
      setIsExporting(false);
      return false;
    }
  };
  
  return {
    exportVideo,
    isExporting,
    progress,
    error,
  };
};




