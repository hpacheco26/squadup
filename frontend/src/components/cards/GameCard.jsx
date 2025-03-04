import React from 'react';

const GameCard = ({ game }) => {
    return (
        <div className="card">
            <div className="card-content">
                <div className="media">
                    <div className="media-content">
                        <p className="title is-5">{game.location}</p>
                        <p className="subtitle is-6">{game.date} at {game.time}</p>
                    </div>
                </div>
                <div className="content">
                    <p><strong>Max Players:</strong> {game.maxPlayers}</p>
                    <p><strong>Min Players:</strong> {game.minPlayers}</p>
                    <p><strong>Sub Time:</strong> {game.subTime} min</p>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
