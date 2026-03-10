import React from 'react';
import { Card } from 'react-bulma-components';
import RankIcon from '../RankIcon';

const PlayerCardMini = ({ player, status, onSwap }) => {
    return (
        <div
            onClick={onSwap}
            style={{
                cursor: onSwap ? 'pointer' : 'default',
                userSelect: 'none',
            }}
        >
            <Card className="mb-2 mx-2">
                <Card.Content style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="title is-6" style={{ margin: 0 }}>{status && <span style={{ marginRight: '6px' }}>{status}</span>}{player?.firstName} {player?.lastName}</h3>
                            <RankIcon rank={player?.rank} size={28} />
                        </div>
                </Card.Content>
            </Card>
        </div>
    );
};

export default PlayerCardMini;
