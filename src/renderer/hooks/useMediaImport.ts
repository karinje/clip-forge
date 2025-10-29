import { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { MediaClip } from '../types/media.types';

export function useMediaImport() {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addClip = useProjectStore((state) => state.addClip);

  const importFiles = async () => {
    try {
      setImporting(true);
      setError(null);

      const result = await window.electronAPI.openFile();

      if (!result.success || result.data.length === 0) {
        setImporting(false);
        return;
      }

      for (const filePath of result.data) {
        try {
          const [metadataResult, thumbnailResult] = await Promise.all([
            window.electronAPI.getVideoMetadata(filePath),
            window.electronAPI.getVideoThumbnail(filePath, 0)
          ]);

          if (metadataResult.success) {
            const clip: MediaClip = {
              id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: filePath.split('/').pop() || 'Unknown',
              filePath,
              duration: metadataResult.data.duration,
              resolution: {
                width: metadataResult.data.width,
                height: metadataResult.data.height,
              },
              format: metadataResult.data.format,
              codec: metadataResult.data.codec,
              fileSize: metadataResult.data.fileSize,
              fps: metadataResult.data.fps,
              bitrate: metadataResult.data.bitrate,
              thumbnail: thumbnailResult.success ? thumbnailResult.data : undefined,
              createdAt: new Date(),
            };

            addClip(clip);
          } else {
            console.error('Failed to get metadata:', metadataResult.error);
            setError(`Failed to import ${filePath.split('/').pop()}: ${metadataResult.error}`);
          }
        } catch (err) {
          console.error('Error processing file:', err);
          setError(`Error processing ${filePath.split('/').pop()}`);
        }
      }
    } catch (err) {
      console.error('Import failed:', err);
      setError('Failed to import files');
    } finally {
      setImporting(false);
    }
  };

  return { importFiles, importing, error };
}

