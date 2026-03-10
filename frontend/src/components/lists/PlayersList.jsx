import React from 'react';
import SwipePlayer from '../SwipePlayer';

const PlayersList = ({ players, leftSwipe, rightSwipe, statusLabel, user, isAdmin }) => {
    function handleLeftSwiped(player) {
        if(leftSwipe) {
            leftSwipe(player.id);
        }
    }
    function handleRightSwiped(player) {        
        if(rightSwipe) {
            rightSwipe(player.id);
        }
    }
    return (
        <div>
            {players.length === 0 ? (
                <p></p>
            ) : (
                <>
                    {players.map(player => (
                        <SwipePlayer key={player.id} player={player} playerStatus={statusLabel} onLeft={() => handleLeftSwiped(player)} onRight={ () => handleRightSwiped(player) }/>
                    ))}
                    <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>Slide to confirm</p>
                </>
            )}
        </div>
    );
};

export default PlayersList