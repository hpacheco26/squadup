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
    0: '#b0b8c4', 
    1: '#cd7f32', 
    2: '#9b59b6', 
    3: '#f0c832', 
    4: '#a8b4d4', 
};

const rankGradients = {
    0: 'linear-gradient(135deg, #c0c8d4, #b0b8c4, #a0a8b4)',
    1: 'linear-gradient(135deg, #e0944a, #cd7f32, #b06a28)',
    2: 'linear-gradient(135deg, #b06ec8, #9b59b6, #8344a0)',
    3: 'linear-gradient(135deg, #f5dc78, #f0c832, #d4a017)',
    4: 'linear-gradient(135deg, #c8d0e8, #a8b4d4, #8898c0, #a8b4d4, #c8d0e8)',
};

const rankGlow = {
    0: 'none',
    1: '0 0 6px rgba(205, 127, 50, 0.4)',
    2: '0 0 8px rgba(155, 89, 182, 0.5), 0 0 16px rgba(155, 89, 182, 0.2)',
    3: '0 0 10px rgba(240, 200, 50, 0.5), 0 0 20px rgba(240, 200, 50, 0.25)',
    4: '0 0 12px rgba(136, 152, 192, 0.6), 0 0 24px rgba(168, 180, 212, 0.3), 0 0 36px rgba(136, 152, 192, 0.2)',
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
