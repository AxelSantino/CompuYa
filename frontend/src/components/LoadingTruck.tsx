// CompuYa/frontend/src/components/LoadingTruck.tsx
import React from 'react';
import './LoadingTruck.css';

const LoadingTruck = () => {
  return (
    <div className="truck-loader">
      <div className="truck-container">
        <div className="truck">
          <div className="cab"></div>
          <div className="trailer"></div>
          <div className="wheels">
            <div className="wheel"></div>
            <div className="wheel"></div>
          </div>
        </div>
      </div>
      <div className="road"></div>
    </div>
  );
};

export default LoadingTruck;
