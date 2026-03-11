import React, { useState, useRef } from 'react';

function GoalCarousel({ value, onChange, color = '#333' }) {
    const [startY, setStartY] = useState(null);
    const [offsetY, setOffsetY] = useState(0);
    const containerRef = useRef(null);

    const handleStart = (e) => {
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setStartY(clientY);
    };

    const handleMove = (e) => {
        if (startY === null) return;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setOffsetY(clientY - startY);
    };

    const handleEnd = () => {
        if (startY === null) return;
        const threshold = 40;
        if (offsetY < -threshold) {
            onChange(value + 1); // swipe up = increment
        } else if (offsetY > threshold && value > 0) {
            onChange(value - 1); // swipe down = decrement
        }
        setStartY(null);
        setOffsetY(0);
    };

    const clampedOffset = Math.max(-60, Math.min(60, offsetY));
    const prevGoal = value > 0 ? value - 1 : '\u00A0';
    const nextGoal = value + 1;

    return (
        <div
            ref={containerRef}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onMouseUp={handleEnd}
            onTouchEnd={handleEnd}
            onMouseLeave={() => { if (startY !== null) handleEnd(); }}
            style={{
                position: 'relative',
                height: '280px',
                overflow: 'hidden',
                cursor: 'grab',
                userSelect: 'none',
                touchAction: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Previous number (faded above) */}
            <span style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: color,
                opacity: 0.07,
                lineHeight: 1,
                marginBottom: '-4px',
                transform: `translateY(${clampedOffset}px)`,
                transition: startY !== null ? 'none' : 'transform 0.2s ease',
            }}>
                {prevGoal}
            </span>

            {/* Current number */}
            <span style={{
                fontSize: value >= 10 ? '10rem' : '14rem',
                fontWeight: 'bold',
                color: color,
                lineHeight: 1,
                transform: `translateY(${clampedOffset}px)`,
                transition: startY !== null ? 'none' : 'transform 0.2s ease, font-size 0.2s ease',
            }}>
                {value}
            </span>

            {/* Next number (faded below) */}
            <span style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: color,
                opacity: 0.07,
                lineHeight: 1,
                marginTop: '-4px',
                transform: `translateY(${clampedOffset}px)`,
                transition: startY !== null ? 'none' : 'transform 0.2s ease',
            }}>
                {nextGoal}
            </span>
        </div>
    );
}

export default GoalCarousel;
