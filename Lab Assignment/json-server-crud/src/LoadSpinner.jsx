// src/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner({ type = 'default', message = 'Loading...' }) {
  return (
    <div className={`spinner-container ${type}`}>
      {type === 'dots' ? (
        <div className="dots-spinner">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      ) : type === 'ring' ? (
        <div className="ring-spinner"></div>
      ) : (
        <div className="default-spinner"></div>
      )}
      <p className="spinner-message">{message}</p>
    </div>
  );
}

export default LoadingSpinner;