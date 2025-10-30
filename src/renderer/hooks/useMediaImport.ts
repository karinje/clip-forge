import { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { MediaClip } from '../types/media.types';

export function useMediaImport() {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addClip = useProjectStore((state) => state.addClip);

  const processFilePaths = async (filePaths: string[]) => {
    for (const filePath of filePaths) {
      try {
        const fileName = filePath.split('/').pop() || 'Unknown';
        const fileExt = fileName.split('.').pop()?.toLowerCase();
        const isAudio = ['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'].includes(fileExt || '');
        
        // Get metadata
        const metadataResult = await window.electronAPI.getVideoMetadata(filePath);
        
        if (metadataResult.success) {
          // Only try to get thumbnail for video files
          let thumbnailResult: { success: boolean; data?: string } = { success: false };
          if (!isAudio && metadataResult.data.width > 0) {
            thumbnailResult = await window.electronAPI.getVideoThumbnail(filePath, 0);
          }
          
          const clip: MediaClip = {
            id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: fileName,
            filePath,
            duration: metadataResult.data.duration,
            resolution: {
              width: metadataResult.data.width || 0,
              height: metadataResult.data.height || 0,
            },
            format: metadataResult.data.format,
            codec: metadataResult.data.codec,
            fileSize: metadataResult.data.fileSize,
            fps: metadataResult.data.fps,
            bitrate: metadataResult.data.bitrate,
            thumbnail: thumbnailResult.success ? thumbnailResult.data : undefined,
            createdAt: new Date(),
            type: isAudio ? 'audio' : 'video',
            hasVideo: metadataResult.data.width > 0,
            hasAudio: true, // Assume audio exists if file imported
          };

          addClip(clip);
        } else {
          // Failed to get metadata
          setError(`Failed to import ${filePath.split('/').pop()}: ${metadataResult.error}`);
        }
      } catch (err) {
        // Error processing file
        setError(`Error processing ${filePath.split('/').pop()}`);
      }
    }
  };

  const importFiles = async () => {
    try {
      setImporting(true);
      setError(null);

      const result = await window.electronAPI.openFile();

      if (!result.success || result.data.length === 0) {
        setImporting(false);
        return;
      }

      await processFilePaths(result.data);
    } catch (err) {
      // Import failed
      setError('Failed to import files');
    } finally {
      setImporting(false);
    }
  };

  const importFromPaths = async (filePaths: string[]) => {
    console.log('🎯 importFromPaths called with:', filePaths);
    try {
      setImporting(true);
      setError(null);
      console.log('🔄 Processing file paths...');
      await processFilePaths(filePaths);
      console.log('✅ Import complete');
    } catch (err) {
      console.error('❌ Import error:', err);
      setError('Failed to import files');
    } finally {
      setImporting(false);
    }
  };

  return { importFiles, importFromPaths, importing, error };
}

