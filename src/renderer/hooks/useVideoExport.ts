import { useState } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useProjectStore } from '../store/projectStore';
import { ExportSettings } from '../components/ExportDialog/ExportDialog';

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const clips = useTimelineStore(state => state.clips);
  const mediaClips = useProjectStore(state => state.clips);
  
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
      if (exportData.length === 1) {
        const clip = exportData[0];
        
        await window.electronAPI.exportVideo({
          inputPath: clip.filePath,
          outputPath: settings.outputPath,
          trimStart: clip.trimStart,
          trimEnd: clip.trimEnd,
          format: settings.format,
          quality: settings.quality,
        });
      } else {
        // Multiple clips - concatenate
        await window.electronAPI.exportMultipleClips({
          clips: exportData,
          outputPath: settings.outputPath,
          format: settings.format,
          quality: settings.quality,
        });
      }
      
      setProgress(100);
      setIsExporting(false);
      
      return true;
    } catch (err: any) {
      console.error('[useVideoExport] Export failed:', err);
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




