import React from 'react';
import LoadingTruck from './LoadingTruck';
import './LoadingOverlay.css';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = React.memo(({ isLoading, text = 'Cargando...' }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-overlay-container">
      <LoadingTruck />
      <p className="loading-text">{text}</p>
    </div>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

export default LoadingOverlay;
