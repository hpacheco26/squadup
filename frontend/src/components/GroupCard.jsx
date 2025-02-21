import React from 'react';
import useHoverEffect from '../hooks/useHoverEffect';  // Reuse the custom hook for hover effect

function GroupCard({ name, sport, id }) {
  // Using the custom hook to manage hover effect state
  const { hoveredId, handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect();

  return (
    <div
      className="card"
      onMouseEnter={() => handleMouseEnter(id)}  // Activate hover effect for this card
      onMouseLeave={handleMouseLeave}  // Deactivate hover effect when mouse leaves
      style={getStyle(id)}  // Apply the hover styles conditionally
    >
      <div className="card-content">
        <h2 className="title is-4">{name}</h2>
        <p className="subtitle is-6">Sport: {sport}</p>
        <p>{id}</p>
      </div>
    </div>
  );
}

export default GroupCard;
