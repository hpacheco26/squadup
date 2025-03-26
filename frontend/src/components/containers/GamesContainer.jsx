import { useNavigate } from 'react-router-dom';
import GameCard from '../cards/GameCard';
import useHoverEffect from '../../hooks/useHoverEffect'; 

const GamesContainer = ({ games }) => {
  const navigate = useNavigate();

  const { handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect(); // Using the custom hook

  const handleGameClick = (gameId) => {
    navigate(`/pregame/${gameId}`);
  };

  return (
    <>
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
    </>
  );
};

export default GamesContainer;
