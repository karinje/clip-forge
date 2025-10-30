import React, { useState, useEffect } from 'react';
import { formatTime } from '../../utils/timeFormatters';
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
  durationMode?: 'main' | 'shortest' | 'longest'; // How to handle duration mismatch
  pipConfig?: {
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    scale: number;
  };
}

import { useTimelineStore } from '../../store/timelineStore';
import { useProjectStore } from '../../store/projectStore';

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
  const [durationMode, setDurationMode] = useState<'main' | 'shortest' | 'longest'>('main');
  const [pipPosition, setPipPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  const [pipScale, setPipScale] = useState(0.25);
  
  const { tracks, clips: timelineClips, showCentiseconds } = useTimelineStore();
  const mediaClips = useProjectStore(state => state.clips);
  const hasMultipleTracks = tracks.length > 1 && tracks.some(t => 
    timelineClips.filter(c => c.trackId === t.id).length > 0
  );
  
  // Calculate total export duration
  const totalDuration = timelineClips.reduce((sum, clip) => sum + clip.duration, 0);
  
  const handleExport = () => {
    if (!outputPath || isExporting) return;
    
    setExportSuccess(false);
    onExport({
      format,
      quality,
      outputPath,
      durationMode: hasMultipleTracks ? durationMode : undefined,
      pipConfig: hasMultipleTracks ? {
        position: pipPosition,
        scale: pipScale,
      } : undefined,
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
          {/* Export Preview Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Export Preview</div>
            <div className={styles.previewInfo}>
              <div className={styles.previewStat}>
                <span className={styles.previewLabel}>Total Clips:</span>
                <span className={styles.previewValue}>{timelineClips.length}</span>
              </div>
              <div className={styles.previewStat}>
                <span className={styles.previewLabel}>Total Duration:</span>
                <span className={styles.previewValue}>{formatTime(totalDuration, showCentiseconds)}</span>
              </div>
              {hasMultipleTracks && (
                <div className={styles.previewStat}>
                  <span className={styles.previewLabel}>Tracks:</span>
                  <span className={styles.previewValue}>{tracks.length} (PiP enabled)</span>
                </div>
              )}
            </div>
            <div className={styles.clipList}>
              {timelineClips.map((clip, idx) => {
                const mediaClip = mediaClips.find(mc => mc.id === clip.mediaClipId);
                return (
                  <div key={clip.id} className={styles.clipPreviewItem}>
                    <span className={styles.clipIndex}>{idx + 1}.</span>
                    <span className={styles.clipName}>{mediaClip?.name || 'Unknown'}</span>
                    <span className={styles.clipDuration}>{formatTime(clip.duration, showCentiseconds)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
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
          
          {hasMultipleTracks && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Multi-Track Settings</div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Duration Mode</label>
                <select 
                  className={styles.select}
                  value={durationMode}
                  onChange={(e) => setDurationMode(e.target.value as any)}
                  disabled={isExporting}
                  title="How to handle duration mismatch between tracks"
                >
                  <option value="main">Main Track Duration (recommended)</option>
                  <option value="shortest">Shortest Track (cut to fit)</option>
                  <option value="longest">Longest Track (freeze/extend)</option>
                </select>
                <div className={styles.hint}>
                  {durationMode === 'main' && 'Export will match main video track length'}
                  {durationMode === 'shortest' && 'Export will match shortest track, cutting others'}
                  {durationMode === 'longest' && 'Export will match longest track, freezing/extending others'}
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Overlay Position</label>
                <select 
                  className={styles.select}
                  value={pipPosition}
                  onChange={(e) => setPipPosition(e.target.value as any)}
                  disabled={isExporting}
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Overlay Size: {Math.round(pipScale * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={pipScale}
                  onChange={(e) => setPipScale(parseFloat(e.target.value))}
                  disabled={isExporting}
                  className={styles.slider}
                />
              </div>
            </div>
          )}
          
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




