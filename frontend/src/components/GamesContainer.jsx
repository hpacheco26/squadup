import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import GameCard from './GameCard';
import useHoverEffect from '../hooks/useHoverEffect';  // Import the custom hook

const GamesContainer = ({ groupId }) => {
  const { games, fetchGamesByGroup, loading, error } = useGameStore();
  const navigate = useNavigate();

  const { hoveredId, handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect(); // Using the custom hook

  useEffect(() => {
    if (groupId) {
      fetchGamesByGroup(groupId);
    }
  }, [groupId, fetchGamesByGroup]);

  const handleGameClick = (gameId) => {
    navigate(`/pregame/${gameId}`);
  };

  if (loading) return <p className="has-text-centered has-text-info">Loading...</p>;
  if (error) return <p className="has-text-centered has-text-danger">Error: {error}</p>;

  return (
    <div className="container">
      <h2 className="title is-3 has-text-centered">Games</h2>
      {games.length === 0 ? (
        <p className="has-text-centered has-text-grey">No games scheduled</p>
      ) : (
        <div className="columns is-multiline">
          {games.map((game) => (
            <div
              className="column is-one-third"
              key={game.id}
              onClick={() => handleGameClick(game.id)}
              onMouseEnter={() => handleMouseEnter(game.id)}  // Pass game ID to the hover effect
              onMouseLeave={handleMouseLeave}
              style={getStyle(game.id)}  // Apply dynamic hover style based on hoveredId
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamesContainer;
