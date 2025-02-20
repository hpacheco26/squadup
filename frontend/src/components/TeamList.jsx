import React from 'react';
import PlayerCardMini from './PlayerCardMini';  // Import PlayerCardMini


const TeamList = ({ team }) => {
    const getPlayerStatus = (index) => {
        if (index < 4) return '⚽️';    // First 4 players are in the field
        if (index === 4) return '🧤';    // 5th player is the goalie
        return '🏖️';                      // Everyone after the 5th player is on the bench
    };

    return (
        <div>
            {team.map((player, index) => {
                const status = getPlayerStatus(index);
                return (
                    <div key={index} style={{ alignItems: 'center', marginBottom: '10px' }}>
                        <PlayerCardMini player={player} status={status} />
                    </div>
                );
            })}
        </div>
    );
};

export default TeamList;
