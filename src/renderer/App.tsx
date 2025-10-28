import React from 'react';
import { MediaLibrary } from './components/MediaLibrary/MediaLibrary';
import { PreviewPlayer } from './components/PreviewPlayer/PreviewPlayer';
import './styles/index.css';

export const App: React.FC = () => {
  return (
    <div className="app">
      <div className="sidebar">
        <MediaLibrary />
      </div>
      <div className="main">
        <PreviewPlayer />
      </div>
    </div>
  );
};

