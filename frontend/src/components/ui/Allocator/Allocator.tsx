import React, { useState, useEffect, useRef } from "react";

interface AllocatorProps {
    maxPotentialValue?: number;  // Optional prop with default value
    potentialValue?: number;
}

const Allocator: React.FC<AllocatorProps> = ({ maxPotentialValue = 200, potentialValue: initialPotentialValue = 0 }) => {
    const [isGrowing, setIsGrowing] = useState(false);
    const [size, setSize] = useState(10);
    const animationRef = useRef(null);
    const [potentialValue, setPotentialValue] = useState(initialPotentialValue);
    const [displayValue, setDisplayValue] = useState(0);
    const animationFrameRef = useRef<number>();

    const maxSize = maxPotentialValue;

    useEffect(() => {
        const updateDisplay = () => {
            setDisplayValue(current => {
                const diff = potentialValue - current;
                if (Math.abs(diff) < 0.05) return Math.round(potentialValue);

                const speed = Math.max(0.15, Math.min(0.3, Math.abs(diff) / 100));
                const newValue = current + (diff * speed);

                return Math.round(newValue);
            });

            animationFrameRef.current = requestAnimationFrame(updateDisplay);
        };

        animationFrameRef.current = requestAnimationFrame(updateDisplay);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [potentialValue]);

    const grow = () => {
        setSize(prevSize => {
            const newSize = prevSize + 1;
            return newSize <= maxSize ? newSize : maxSize;
        });

        setPotentialValue(prevValue => {
            const newValue = Math.round((size / maxSize) * maxPotentialValue);
            if (size >= maxSize - 1) return maxPotentialValue;
            return newValue;
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
                {Math.round(displayValue)}
            </div>
        </div>
    );
};

export default Allocator;
