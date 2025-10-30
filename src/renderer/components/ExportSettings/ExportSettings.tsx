import React, { useState } from 'react';
import { useExportSettingsStore } from '../../store/exportSettingsStore';
import styles from './ExportSettings.module.css';

export const ExportSettings: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useExportSettingsStore();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerLeft}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6M5.6 5.6l4.2 4.2m4.2 4.2l4.2 4.2M1 12h6m6 0h6M5.6 18.4l4.2-4.2m4.2-4.2l4.2-4.2"/>
          </svg>
          <span className={styles.title}>Export Settings</span>
        </div>
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`${styles.chevron} ${isExpanded ? styles.expanded : ''}`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </div>
      
      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.section}>
            <label className={styles.label}>Video Format</label>
            <select 
              className={styles.select}
              value={settings.format}
              onChange={(e) => updateSettings({ format: e.target.value as any })}
            >
              <option value="mp4">MP4 (H.264)</option>
              <option value="webm">WebM (VP9)</option>
              <option value="mov">MOV (QuickTime)</option>
            </select>
          </div>
          
          <div className={styles.section}>
            <label className={styles.label}>Quality</label>
            <select 
              className={styles.select}
              value={settings.quality}
              onChange={(e) => updateSettings({ quality: e.target.value as any })}
            >
              <option value="high">High (Best quality, larger file)</option>
              <option value="medium">Medium (Balanced)</option>
              <option value="low">Low (Smaller file)</option>
            </select>
          </div>
          
          <div className={styles.section}>
            <label className={styles.label}>Duration Mode</label>
            <select 
              className={styles.select}
              value={settings.durationMode}
              onChange={(e) => updateSettings({ durationMode: e.target.value as any })}
            >
              <option value="main">Main Track Duration</option>
              <option value="shortest">Shortest Track</option>
              <option value="longest">Longest Track</option>
            </select>
            <div className={styles.hint}>
              {settings.durationMode === 'main' && 'Export matches main video track length'}
              {settings.durationMode === 'shortest' && 'Export matches shortest track'}
              {settings.durationMode === 'longest' && 'Export matches longest track'}
            </div>
          </div>
          
          <div className={styles.divider} />
          
          <div className={styles.sectionTitle}>Picture-in-Picture</div>
          
          <div className={styles.section}>
            <label className={styles.label}>Overlay Position</label>
            <select 
              className={styles.select}
              value={settings.pipPosition}
              onChange={(e) => updateSettings({ pipPosition: e.target.value as any })}
            >
              <option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
            </select>
          </div>
          
          <div className={styles.section}>
            <label className={styles.label}>Overlay Size: {Math.round(settings.pipScale * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={settings.pipScale}
              onChange={(e) => updateSettings({ pipScale: parseFloat(e.target.value) })}
              className={styles.slider}
            />
          </div>
          
          <button 
            className={styles.resetButton}
            onClick={resetSettings}
            title="Reset all settings to defaults"
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
};

