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
    0: '#94a3b8', 
    1: '#5eead4', 
    2: '#2dd4bf', 
    3: '#14b8a6', 
    4: '#0d9488', 
  };


const RankIcon = ({ rank, size = 30 }) => {
    const shapeStyle = shapeStyles[rank] || {};
    const color = rankColors[rank] || '#94a3b8'; // Default to neutral gray if rank is unknown

    return (
        <div 
            style={{ 
                "--size": `${size}px`, // CSS Variable for consistent scaling
                width: size, 
                height: size, 
                backgroundColor: color, 
                display: 'inline-block',
                ...shapeStyle
            }} 
        />
    );
};

export default RankIcon;
