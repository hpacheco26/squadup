import React from 'react';
import SwipePlayer from '../SwipePlayer';

const PlayersList = ({ players, onGameOn, onOut, statusLabel, user, isAdmin }) => {
    function handleLeftSwiped(player) {
        if(onOut) {
            onOut(player.id);
        }
    }
    function handleRightSwiped(player) {        
        if(onGameOn) {
            onGameOn(player.id);
        }
    }
    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {players.length === 0 ? (
                <p>No players in this category.</p>
            ) : (
                players.map(player => (
                    <SwipePlayer key={player.id} player={player} playerStatus={statusLabel} onLeft={() => handleLeftSwiped(player)} onRight={ () => handleRightSwiped(player) }/>
                ))
            )}
        </div>
    );
};

export default PlayersList