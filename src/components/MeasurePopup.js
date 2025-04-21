// src/components/MeasurePopup.js
import React, { useState, useEffect } from 'react';
import styles from './MeasurePopup.module.css';
import { FaTimes, FaCheck } from 'react-icons/fa';

const MeasurePopup = ({ isOpen, onClose, onApply }) => {
  const [distanceUnit, setDistanceUnit] = useState('');
  const [areaUnit, setAreaUnit] = useState('');

  // Reset form when popup opens/closes (optional)
  useEffect(() => {
    if (isOpen) {
      // Optionally load current settings here if they exist
      setDistanceUnit(''); // Or load saved value
      setAreaUnit('');   // Or load saved value
    }
  }, [isOpen]);

  const handleApplyClick = () => {
    console.log('Applying units:', { distanceUnit, areaUnit });
    if (onApply) {
      onApply({ distanceUnit, areaUnit }); // Pass data back to parent
    }
    onClose(); // Close popup after applying
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    // Optional: Add an overlay behind the popup
    // <div className={styles.overlay} onClick={onClose}>

    <div className={styles.popupContainer}>
      <div className={styles.popupHeader}>
        <h3 className={styles.popupTitle}>Area Measurement Unit</h3>
        <button onClick={onClose} className={styles.closeButton} title="Close">
          <FaTimes />
        </button>
      </div>
      <div className={styles.popupBody}>
        <div className={styles.formGroup}>
          <label htmlFor="distanceUnit" className={styles.label}>
            Distance Unit
          </label>
          <input
            type="text"
            id="distanceUnit"
            className={styles.input}
            value={distanceUnit}
            onChange={(e) => setDistanceUnit(e.target.value)}
            placeholder="e.g., km, miles" // Add placeholder
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="areaUnit" className={styles.label}>
            Area Unit
          </label>
          <input
            type="text"
            id="areaUnit"
            className={styles.input}
            value={areaUnit}
            onChange={(e) => setAreaUnit(e.target.value)}
            placeholder="e.g., sq km, acres" // Add placeholder
          />
        </div>
      </div>
      <div className={styles.popupFooter}>
        <button onClick={handleApplyClick} className={`${styles.button} ${styles.applyButton}`}>
          <FaCheck size={12} style={{ marginRight: '5px' }} /> Apply
        </button>
        <button onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>
          <FaTimes size={12} style={{ marginRight: '5px' }}/> Cancel
        </button>
      </div>
    </div>

    // </div> // Closing overlay div
  );
};

export default MeasurePopup;