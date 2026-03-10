import React from 'react';

const shapeStyles = {
    0: { borderRadius: "50%" }, // Circle
    1: { 
        width: 0, 
        height: 0, 
        borderLeft: "calc(0.5 * var(--size)) solid transparent",
        borderRight: "calc(0.5 * var(--size)) solid transparent",
        borderBottom: "var(--size) solid currentColor", 
        background: "none" 
    }, // Triangle
    2: {}, // Square (default)
    3: { clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }, // Pentagon
    4: { clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" } // Hexagon
};

const rankColors = {
    0: '#d4c5a0', 
    1: '#c9a84c', 
    2: '#b8922e', 
    3: '#a67c00', 
    4: '#8b6914', 
};

const rankGradients = {
    0: 'linear-gradient(135deg, #d4c5a0, #c2b48e)',
    1: 'linear-gradient(135deg, #e0c35a, #c9a84c, #b8922e)',
    2: 'linear-gradient(135deg, #d4ab3a, #b8922e, #a67c00)',
    3: 'linear-gradient(135deg, #d4a017, #a67c00, #8b6914)',
    4: 'linear-gradient(135deg, #c9a84c, #8b6914, #6b5010, #8b6914, #c9a84c)',
};

const rankGlow = {
    0: 'none',
    1: '0 0 4px rgba(201, 168, 76, 0.3)',
    2: '0 0 6px rgba(184, 146, 46, 0.4)',
    3: '0 0 8px rgba(166, 124, 0, 0.5), 0 0 16px rgba(166, 124, 0, 0.2)',
    4: '0 0 10px rgba(139, 105, 20, 0.6), 0 0 20px rgba(201, 168, 76, 0.3), 0 0 30px rgba(139, 105, 20, 0.15)',
};


const RankIcon = ({ rank, size = 30 }) => {
    const shapeStyle = shapeStyles[rank] || {};
    const color = rankColors[rank] || '#d4c5a0';
    const isTriangle = rank === 1;

    return (
        <div style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
            <div 
                style={{ 
                    "--size": `${size}px`,
                    width: size, 
                    height: size, 
                    background: isTriangle ? 'none' : (rankGradients[rank] || color),
                    backgroundColor: isTriangle ? undefined : undefined,
                    boxShadow: isTriangle ? 'none' : (rankGlow[rank] || 'none'),
                    display: 'inline-block',
                    ...shapeStyle,
                    ...(isTriangle ? { borderBottomColor: color } : {}),
                }} 
            />
            {rank >= 3 && !isTriangle && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: size,
                    height: size,
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.25) 55%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 3s ease-in-out infinite',
                    pointerEvents: 'none',
                    ...shapeStyle,
                }} />
            )}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
        </div>
    );
};

export default RankIcon;
