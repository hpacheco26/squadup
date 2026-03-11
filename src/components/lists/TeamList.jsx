import React, { useState } from 'react';
import PlayerCardMini from '../cards/PlayerCardMini';  
import { Button } from 'react-bulma-components';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { TbBallFootball, TbHandStop, TbBottle } from 'react-icons/tb';

const iconStyle = { color: '#94a3b8', flexShrink: 0 };

const TeamList = ({ team }) => {
    const [isCollapsed, setIsCollapsed] = useState(true); // Start with collapsed state

    const handleToggle = () => {
        setIsCollapsed((prev) => !prev); // Toggle collapse state
    };

    const getPlayerStatus = (index) => {
        if (index < 4) return <TbBallFootball size={16} style={iconStyle} />;
        if (index === 4) return <TbHandStop size={16} style={iconStyle} />;
        return <TbBottle size={16} style={iconStyle} />;
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
                    top: 0,
                    right: 0,
                    fontSize: '18px',
                    padding: '5px',
                    cursor: 'pointer',
                }}
            >
                {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </Button>

            {/* Render Players */}
            {displayedPlayers.map((player, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <PlayerCardMini player={player} status={getPlayerStatus(index)} />
                </div>
            ))}
        </div>
    );
};

export default TeamList;
