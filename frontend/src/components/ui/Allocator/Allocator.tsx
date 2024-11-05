import React, { useState, useEffect, useRef } from "react";

interface AllocatorProps {
    maxPotentialValue?: number;  // Optional prop with default value
}

const Allocator: React.FC<AllocatorProps> = ({ maxPotentialValue = 200 }) => {
    const [isGrowing, setIsGrowing] = useState(false);
    const [size, setSize] = useState(10);
    const animationRef = useRef(null);
    
    const maxSize = maxPotentialValue;

    // Calculate value directly from size
    const currentValue = Math.round((size / maxSize) * maxPotentialValue);

    const grow = () => {
        setSize(prevSize => {
            const newSize = prevSize + 1;
            return newSize <= maxSize ? newSize : maxSize;
        });
        
        animationRef.current = requestAnimationFrame(grow);
    };

    const handleMouseDown = () => {
        setIsGrowing(true);
        animationRef.current = requestAnimationFrame(grow);
    };

    const handleMouseUp = () => {
        setIsGrowing(false);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    return (
        <div
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
                width: `${maxSize}px`,
                height: `${maxSize}px`,
                borderRadius: "50%",
                backgroundColor: "#ccc",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
            }}
        >
            <div
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: "50%",
                    backgroundColor: "#bde8bf",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    userSelect: "none",
                }}
            >
                {currentValue}
            </div>
        </div>
    );
};

export default Allocator;
