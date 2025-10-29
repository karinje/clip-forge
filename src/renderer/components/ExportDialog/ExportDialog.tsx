import React, { useState, useEffect } from 'react';
import styles from './ExportDialog.module.css';

interface Props {
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
  isExporting: boolean;
  progress: number;
  error: string | null;
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'mov';
  quality: 'high' | 'medium' | 'low';
  outputPath: string;
}

export const ExportDialog: React.FC<Props> = ({
  onClose,
  onExport,
  isExporting,
  progress,
  error,
}) => {
  const [format, setFormat] = useState<'mp4' | 'webm' | 'mov'>('mp4');
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [outputPath, setOutputPath] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const handleExport = () => {
    if (!outputPath || isExporting) return;
    
    setExportSuccess(false);
    onExport({
      format,
      quality,
      outputPath,
    });
  };
  
  const handleBrowse = async () => {
    const path = await window.electronAPI.saveFile();
    if (path) {
      setOutputPath(path);
    }
  };
  
  // Show success when export completes
  useEffect(() => {
    if (!isExporting && progress === 100 && !error) {
      setExportSuccess(true);
    }
  }, [isExporting, progress, error]);
  
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <div className={styles.title}>Export Video</div>
          <button className={styles.closeButton} onClick={onClose} disabled={isExporting}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Format</div>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="format"
                  value="mp4"
                  checked={format === 'mp4'}
                  onChange={() => setFormat('mp4')}
                  disabled={isExporting}
                />
                <span className={styles.radioLabel}>MP4 (H.264)</span>
              </label>
              <div className={styles.radioDescription}>Best compatibility</div>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="format"
                  value="webm"
                  checked={format === 'webm'}
                  onChange={() => setFormat('webm')}
                  disabled={isExporting}
                />
                <span className={styles.radioLabel}>WebM (VP9)</span>
              </label>
              <div className={styles.radioDescription}>Smaller file size</div>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="format"
                  value="mov"
                  checked={format === 'mov'}
                  onChange={() => setFormat('mov')}
                  disabled={isExporting}
                />
                <span className={styles.radioLabel}>MOV (ProRes)</span>
              </label>
              <div className={styles.radioDescription}>Highest quality</div>
            </div>
          </div>
          
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Quality</div>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="quality"
                  value="high"
                  checked={quality === 'high'}
                  onChange={() => setQuality('high')}
                  disabled={isExporting}
                />
                <span className={styles.radioLabel}>High (1080p)</span>
              </label>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="quality"
                  value="medium"
                  checked={quality === 'medium'}
                  onChange={() => setQuality('medium')}
                  disabled={isExporting}
                />
                <span className={styles.radioLabel}>Medium (720p)</span>
              </label>
              
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="quality"
                  value="low"
                  checked={quality === 'low'}
                  onChange={() => setQuality('low')}
                  disabled={isExporting}
                />
                <span className={styles.radioLabel}>Low (480p)</span>
              </label>
            </div>
          </div>
          
          <div className={styles.section}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Output Path</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className={styles.input}
                  value={outputPath}
                  onChange={(e) => setOutputPath(e.target.value)}
                  placeholder="Choose output location..."
                  disabled={isExporting}
                  style={{ flex: 1 }}
                />
                <button
                  className={styles.button + ' ' + styles.cancelButton}
                  onClick={handleBrowse}
                  disabled={isExporting}
                >
                  Browse
                </button>
              </div>
            </div>
          </div>
          
          {isExporting && (
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <div className={styles.progressText}>
                Exporting... {Math.round(progress)}%
              </div>
            </div>
          )}
          
          {exportSuccess && !error && (
            <div className={styles.success}>
              ✓ Export successful! File saved to: {outputPath}
            </div>
          )}
          
          {error && (
            <div className={styles.error}>
              ✗ Export failed: {error}
              <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.8 }}>
                The video file was not generated. Please check your output path and try again.
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.footer}>
          <button
            className={styles.button + ' ' + styles.cancelButton}
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            className={styles.button + ' ' + styles.exportButton}
            onClick={handleExport}
            disabled={!outputPath || isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};




