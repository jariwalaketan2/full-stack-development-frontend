import React from 'react';

export const Legend: React.FC = () => (
  <div className="legend">
    <h3>Legend</h3>
    <div className="legend-items">
      <div className="legend-item">
        <div className="legend-color" style={{ background: '#2196F3' }}></div>
        <span>Available</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: '#4CAF50' }}></div>
        <span>Selected</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: '#FF9800' }}></div>
        <span>Reserved</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: '#F44336' }}></div>
        <span>Sold</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ background: '#9C27B0' }}></div>
        <span>Held</span>
      </div>
    </div>
  </div>
);