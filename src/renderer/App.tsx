import React from 'react';
import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
import './styles/index.css';

export const App: React.FC = () => {
  return (
    <div className="app">
      <div className="sidebar">
        <MediaLibrary />
      </div>
      <div className="main">
        <div className="placeholder">
          <h1>ClipForge</h1>
          <p>Import videos to get started</p>
        </div>
      </div>
    </div>
  );
};

