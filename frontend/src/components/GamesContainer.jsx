import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import GameCard from './GameCard';

const GamesContainer = ({ groupId }) => {
    const { games, fetchGamesByGroup, loading, error } = useGameStore();
    const navigate = useNavigate();

    const [hoveredGameId, setHoveredGameId] = useState(null); // Track hovered game

    useEffect(() => {
        if (groupId) {
            fetchGamesByGroup(groupId); 
        }
    }, [groupId, fetchGamesByGroup]);

    const handleGameClick = (gameId) => {
        navigate(`/pregame/${gameId}`);
    };

    const handleMouseEnter = (gameId) => {
        setHoveredGameId(gameId);
    };

    const handleMouseLeave = () => {
        setHoveredGameId(null);
    };

    const getContainerStyle = (gameId) => {
        return {
            cursor: 'pointer', 
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: hoveredGameId === gameId ? 'scale(1.05)' : 'scale(1)',
        };
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
                    {games.map(game => (
                        <div 
                            className="column is-one-third" 
                            key={game.id}
                            onClick={() => handleGameClick(game.id)}
                            onMouseEnter={() => handleMouseEnter(game.id)} 
                            onMouseLeave={handleMouseLeave} 
                            style={getContainerStyle(game.id)} // Inline style for hover effect
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
