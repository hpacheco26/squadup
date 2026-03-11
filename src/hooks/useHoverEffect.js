// src/hooks/useHoverEffect.js

import { useState } from 'react';

const useHoverEffect = () => {
  const [hoveredId, setHoveredId] = useState(null);

  const handleMouseEnter = (id) => {
    setHoveredId(id); // Set the hovered ID when mouse enters
  };

  const handleMouseLeave = () => {
    setHoveredId(null); // Reset the hovered ID when mouse leaves
  };

  const getStyle = (id) => ({
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    transform: hoveredId === id ? 'scale(1.05)' : 'scale(1)', // Scale effect
  });

  return {
    hoveredId,
    handleMouseEnter,
    handleMouseLeave,
    getStyle,
  };
};

export default useHoverEffect;
