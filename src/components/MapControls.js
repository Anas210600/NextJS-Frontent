// src/components/MapControls.js
import React from 'react';
import styles from './MapControls.module.css';
import {
  FaMapMarkerAlt,     // For Locate Me
  FaStar,             // For Favorites
  FaLayerGroup,       // For Layers
  FaTrafficLight,     // Example for Traffic
  FaPaperPlane,       // For Toggling Vehicles ('send' ID)
  FaCrosshairs,       // Example for GPS Center
  FaDrawPolygon,      // Example for Drawing Area
  FaRulerHorizontal,  // For Measurement Popup ('measure' ID)
  FaSync,             // Example for Refresh
  FaPlus,             // For Zoom In
  FaMinus             // For Zoom Out
} from 'react-icons/fa';

// Define the configuration for the top control buttons
const topControls = [
  { id: 'locate', icon: FaMapMarkerAlt, label: 'Locate Me' },
  { id: 'favorites', icon: FaStar, label: 'Favorites' },
  { id: 'layers', icon: FaLayerGroup, label: 'Layers' },
  { id: 'traffic', icon: FaTrafficLight, label: 'Traffic' },
  { id: 'send', icon: FaPaperPlane, label: 'Toggle Vehicles' }, // ID used in Home.js
  { id: 'gps', icon: FaCrosshairs, label: 'Center on GPS' },
  { id: 'draw', icon: FaDrawPolygon, label: 'Draw Area' },
  { id: 'measure', icon: FaRulerHorizontal, label: 'Measurement Units' }, // ID used in Home.js
  { id: 'refresh', icon: FaSync, label: 'Refresh Data' },
];


const MapControls = ({ onZoomIn, onZoomOut, onControlClick }) => {

  // Generic handler that calls the prop passed from the parent (Home.js)
  const handleClick = (id) => {
    if (onControlClick) {
      onControlClick(id); // Let the parent component handle the logic
    } else {
        console.warn(`onControlClick handler not provided for control ID: ${id}`);
    }
  };

  return (
    <>
      {/* Top Control Group (Custom Icons) */}
      <div className={`${styles.controlsContainer} ${styles.topControls}`}>
        {topControls.map(control => (
          <button
            key={control.id}
            className={styles.controlButton}
            // Call the generic handleClick, passing the specific control's ID
            onClick={() => handleClick(control.id)}
            title={control.label} // Tooltip for accessibility
          >
            <control.icon size={18} />
          </button>
        ))}
      </div>

      {/* Zoom Control Group */}
       <div className={`${styles.controlsContainer} ${styles.zoomControls}`}>
           {/* Use specific handlers if provided, otherwise fallback to generic click (less common for zoom) */}
           <button
             className={styles.controlButton}
             // Prefer specific handler for zoom
             onClick={onZoomIn || (() => handleClick('zoomIn'))}
             title="Zoom In"
            >
              <FaPlus size={16}/>
           </button>
           <button
             className={styles.controlButton}
             // Prefer specific handler for zoom
             onClick={onZoomOut || (() => handleClick('zoomOut'))}
             title="Zoom Out"
            >
              <FaMinus size={16}/>
           </button>
       </div>
    </>
  );
};

export default MapControls;