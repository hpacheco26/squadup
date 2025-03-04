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
    0: '#ddd8c4', 
    1: '#a3c9a8', 
    2: '#84b59f', 
    3: '#69a297', 
    4: '#50808e', 
  };


const RankIcon = ({ rank, size = 30 }) => {
    const shapeStyle = shapeStyles[rank] || {};
    const color = rankColors[rank] || '#9E9E9E'; // Default to neutral gray if rank is unknown

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
