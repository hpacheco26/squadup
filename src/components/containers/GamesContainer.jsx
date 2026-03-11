import { useNavigate } from 'react-router-dom';
import GameCard from '../cards/GameCard';
import useHoverEffect from '../../hooks/useHoverEffect'; 

const GamesContainer = ({ games, readOnly = false }) => {
  const navigate = useNavigate();

  const { handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect(); // Using the custom hook

  const handleGameClick = (gameId) => {
    if (!readOnly) navigate(`/pregame/${gameId}`);
  };

  return (
    <>
      {games.length === 0 ? (
        <p className="has-text-centered has-text-grey">No games scheduled</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game.id)}
              onMouseEnter={readOnly ? undefined : () => handleMouseEnter(game.id)}
              onMouseLeave={readOnly ? undefined : handleMouseLeave}
              style={readOnly ? {} : getStyle(game.id)}
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
