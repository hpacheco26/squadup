import { useNavigate } from 'react-router-dom';
import GameCard from '../cards/GameCard';
import useHoverEffect from '../../hooks/useHoverEffect';
import useLanguageStore from '../../store/languageStore'; 

const GamesContainer = ({ games, readOnly = false }) => {
  const navigate = useNavigate();

  const { handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect();
  const { t } = useLanguageStore(); // Using the custom hook

  const handleGameClick = (gameId) => {
    if (!readOnly) navigate(`/pregame/${gameId}`);
  };

  return (
    <>
      {games.length === 0 ? (
        <p className="has-text-centered has-text-grey">{t('noGamesScheduled')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game.id)}
              onMouseEnter={readOnly ? undefined : () => handleMouseEnter(game.id)}
              onMouseLeave={readOnly ? undefined : handleMouseLeave}
              style={readOnly ? { cursor: 'default' } : { cursor: 'pointer', ...getStyle(game.id) }}
            >
              <GameCard game={game} t={t} showGroupName={false} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default GamesContainer;
