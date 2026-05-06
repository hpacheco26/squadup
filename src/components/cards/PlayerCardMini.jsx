import React from 'react';
import RankIcon from '../RankIcon';

const PlayerCardMini = ({ player, status, onSwap }) => {
    return (
        <div
            onClick={onSwap}
            style={{
                cursor: onSwap ? 'pointer' : 'default',
                userSelect: 'none',
                margin: '0 8px 8px',
                borderRadius: '4px',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
        >
            <div style={{ padding: '8px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--c-text)' }}>
                        {status && <span style={{ marginRight: '6px' }}>{status}</span>}
                        {player?.firstName} {player?.lastName}
                    </span>
                    <RankIcon rank={player?.rank} size={28} />
                </div>
            </div>
        </div>
    );
};

export default PlayerCardMini;
