import React, { useState, useRef } from 'react';
import styles from './allocator.module.css';

interface AllocatorProps {
    potentialValue: number;
    maxPotentialAllocatableByPlayer: number;
}

const Allocator = ({ potentialValue, maxPotentialAllocatableByPlayer }: AllocatorProps) => {
  const [selectedValue, setSelectedValue] = useState(0);
  const containerRef = useRef(null);

  const Potential_Value = 100;
  const Max_Potential_Allocatable_By_Player = 30;

  const handleMouseDown = (event: { clientX: number; clientY: number; }) => {
    if (containerRef.current) {
      const rect = (containerRef.current as HTMLDivElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = Math.min(rect.width, rect.height) / 2;
      const value = (distance / maxDistance) * Max_Potential_Allocatable_By_Player;
      setSelectedValue(value);
    }
  };

  const handleMouseMove = (event: { clientX: number; clientY: number; }) => {
    if (containerRef.current) {
        const rect = (containerRef.current as HTMLDivElement).getBoundingClientRect();
        const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = Math.min(rect.width, rect.height) / 2;
      const value = (distance / maxDistance) * Max_Potential_Allocatable_By_Player;
      setSelectedValue(value);
    }
  };

  const handleMouseUp = () => {
    setSelectedValue(0);
  };

  return (
        <div
          ref={containerRef}
          className={styles.container}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className={styles.circle}
            style={{
              width: `${Potential_Value * 2}px`,
              height: `${Potential_Value * 2}px`,
              opacity: 0.2,
            }}
          />
          <div
            className={styles.circle}
            style={{
              width: `${Max_Potential_Allocatable_By_Player * 2}px`,
              height: `${Max_Potential_Allocatable_By_Player * 2}px`,
              opacity: 0.4,
            }}
          />
          <div
            className={styles.circle}
            style={{
              width: `${selectedValue * 2}px`,
              height: `${selectedValue * 2}px`,
              opacity: 0.6,
            }}
          />
        </div>
  );
};

export default Allocator;