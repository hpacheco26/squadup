import React from 'react';

const RankIcon = ({ rank, size = 30 }) => {  // Default size set to 30px
    const shapeStyles = {
        0: { borderRadius: '50%' }, // Circle
        1: { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }, // Triangle
        2: {}, // Square (default)
        3: { clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }, // Pentagon
        4: { clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }, // Hexagon
    };

    const rankColors = {
        0: 'gold',      // Circle - Gold
        1: 'blue',      // Triangle - Blue
        2: 'green',     // Square - Green
        3: 'purple',    // Pentagon - Purple
        4: 'red',       // Hexagon - Red
    };

    return (
        <div 
            style={{ 
                width: `${size}px`, 
                height: `${size}px`, 
                backgroundColor: rankColors[rank] || 'gray', // Default to gray if no rank matches
                display: 'inline-block',
                ...shapeStyles[rank] 
            }} 
        />
    );
};

export default RankIcon;
