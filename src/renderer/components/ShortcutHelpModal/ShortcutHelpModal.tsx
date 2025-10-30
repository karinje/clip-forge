import React from 'react';
import styles from './ShortcutHelpModal.module.css';

interface Props {
  onClose: () => void;
}

interface Shortcut {
  keys: string;
  description: string;
}

interface ShortcutCategory {
  category: string;
  shortcuts: Shortcut[];
}

const SHORTCUTS: ShortcutCategory[] = [
  {
    category: 'Playback',
    shortcuts: [
      { keys: 'Space', description: 'Play / Pause' },
      { keys: 'Shift + ← →', description: 'Extend selection (0.1s per press)' },
      { keys: 'Esc', description: 'Clear selection' },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      { keys: 'J', description: 'Rewind 5 seconds' },
      { keys: 'L', description: 'Fast forward 5 seconds' },
      { keys: '[', description: 'Jump to previous clip edge' },
      { keys: ']', description: 'Jump to next clip edge' },
    ],
  },
  {
    category: 'Editing',
    shortcuts: [
      { keys: 'Delete', description: 'Delete selected clip or region' },
      { keys: 'Shift + Delete', description: 'Delete trimmed region, keep segments' },
      { keys: 'Cmd/Ctrl + K', description: 'Split clip at playhead' },
      { keys: 'Cmd/Ctrl + D', description: 'Duplicate selected clip' },
      { keys: 'Cmd/Ctrl + Shift + S', description: 'Toggle snap to grid/clips' },
    ],
  },
  {
    category: 'Export',
    shortcuts: [
      { keys: 'Cmd/Ctrl + E', description: 'Open export dialog' },
      { keys: 'Cmd/Ctrl + ?', description: 'Show this shortcuts dialog' },
    ],
  },
];

export const ShortcutHelpModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.content}>
          {SHORTCUTS.map((category) => (
            <div key={category.category} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category.category}</h3>
              <div className={styles.shortcuts}>
                {category.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className={styles.shortcut}>
                    <kbd className={styles.keys}>{shortcut.keys}</kbd>
                    <span className={styles.description}>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

