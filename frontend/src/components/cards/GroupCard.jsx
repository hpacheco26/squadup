import React from 'react';
import useHoverEffect from '../../hooks/useHoverEffect';
import RankIcon from '../RankIcon'; // Import RankIcon component

function GroupCard({ name, sport, id, rank }) {
  const { handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect();

  return (
    <div
      className="card"
      onMouseEnter={() => handleMouseEnter(id)}
      onMouseLeave={handleMouseLeave}
      style={{ position: 'relative', ...getStyle(id) }} // Ensure relative positioning
    >
      <div className="card-content">
        <h2 className="title is-4">{name}</h2>
        <p className="subtitle is-6">Sport: {sport}</p>
        <p>{id}</p>
      </div>

      {/* Rank Icon at Bottom Right */}
      <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
        <RankIcon rank={rank} size={30} />
      </div>
    </div>
  );
}

export default GroupCard;
