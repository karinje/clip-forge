import { useState, useEffect } from 'react';
import { useTimelineStore } from '../store/timelineStore';
import { useProjectStore } from '../store/projectStore';
import { ExportSettings } from '../components/ExportDialog/ExportDialog';

export const useVideoExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const clips = useTimelineStore(state => state.clips);
  const tracks = useTimelineStore(state => state.tracks);
  const soloTrackId = useTimelineStore(state => state.soloTrackId);
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
      // Check if we have multiple tracks with clips
      const hasMultipleTracks = tracks.length > 1 && tracks.some(t => 
        clips.filter(c => c.trackId === t.id).length > 0
      );
      
      if (hasMultipleTracks) {
        // Multi-track export with PiP
        const trackData = tracks.map(track => {
          const trackClips = clips.filter(c => c.trackId === track.id);
          // Handle solo: if any track is solo'd, mute all others
          const effectiveMuted = soloTrackId !== null 
            ? soloTrackId !== track.id  // Mute this track if it's not the solo'd one
            : track.muted;               // Otherwise use track's mute state
          
          return {
            type: track.type,
            muted: effectiveMuted,
            volume: track.volume,
            clips: trackClips.map(clip => {
              const mediaClip = mediaClips.find(mc => mc.id === clip.mediaClipId);
              if (!mediaClip) {
                console.error('❌ Export error - clip not found in library:', {
                  timelineClipId: clip.id,
                  mediaClipId: clip.mediaClipId,
                  availableMediaClips: mediaClips.map(mc => mc.id)
                });
                throw new Error(`Media clip not found: ${clip.mediaClipId}. Try removing this clip from timeline and re-adding it.`);
              }
              return {
                filePath: mediaClip.filePath,
                trimStart: clip.trimStart,
                trimEnd: clip.trimEnd,
                duration: clip.duration,
                audioOnly: clip.audioOnly,
                volume: clip.volume,
              };
            }),
          };
        }).filter(track => track.clips.length > 0);
        
        const result = await window.electronAPI.exportMultiTrack({
          tracks: trackData,
          outputPath: settings.outputPath,
          format: settings.format,
          quality: settings.quality,
          durationMode: settings.durationMode || 'main',
          pipConfig: settings.pipConfig || { position: 'bottom-right', scale: 0.25 },
        });
        
        if (result.success) {
          setProgress(100);
          setIsExporting(false);
          return true;
        } else {
          setError(result.error || 'Multi-track export failed');
          setIsExporting(false);
          return false;
        }
      } else {
        // Single track export
        const exportData = clips.map(clip => {
          const mediaClip = mediaClips.find(mc => mc.id === clip.mediaClipId);
          if (!mediaClip) {
            console.error('❌ Export error - clip not found in library:', {
              timelineClipId: clip.id,
              mediaClipId: clip.mediaClipId,
              availableMediaClips: mediaClips.map(mc => mc.id)
            });
            throw new Error(`Media clip not found: ${clip.mediaClipId}. Try removing this clip from timeline and re-adding it.`);
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




