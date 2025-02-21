import React, { useState } from 'react';
import PlayerCardMini from './PlayerCardMini';  
import { Button } from 'react-bulma-components';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Toggle icons

const TeamList = ({ team }) => {
    const [isCollapsed, setIsCollapsed] = useState(true); // Start with collapsed state

    const handleToggle = () => {
        setIsCollapsed((prev) => !prev); // Toggle collapse state
    };

    const getPlayerStatus = (index) => {
        if (index < 4) return '⚽️';  // First 4 players are on the field
        if (index === 4) return '🧤';  // 5th player is the goalie
        return '🏖️';  // Rest are on the bench
    };

    // Show only the first player if collapsed
    const displayedPlayers = isCollapsed ? [team[0]] : team;

    return (
        <div style={{ position: 'relative', paddingTop: '10px' }}>
            {/* Toggle Button */}
            <Button
                color="link"
                onClick={handleToggle}
                style={{
                    position: 'absolute',
                    top: -50,
                    right: -10,
                    fontSize: '18px',
                    padding: '5px',
                }}
            >
                {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </Button>

            {/* Render Players */}
            {displayedPlayers.map((player, index) => (
                <div key={index} style={{ alignItems: 'center', marginBottom: '10px' }}>
                    <PlayerCardMini player={player} status={getPlayerStatus(index)} />
                </div>
            ))}
        </div>
    );
};

export default TeamList;
