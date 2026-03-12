import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import RankIcon from '../RankIcon';

const rankNames = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum'];

function PlayerCard({ player, onRemovePlayer, onUpdatePlayer }) {
    const { id, firstName, lastName, rank, stats, userId } = player;
    const [confirmRemove, setConfirmRemove] = useState(false);

    const handleRemove = () => {
        if (!confirmRemove) {
            setConfirmRemove(true);
            setTimeout(() => setConfirmRemove(false), 3000);
            return;
        }
        if (onRemovePlayer) onRemovePlayer(id);
    };

    const totalGames = (stats?.wins || 0) + (stats?.draws || 0) + (stats?.losses || 0);
    const isGuest = !userId;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: isGuest ? '#f8fafc' : '#fff',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid #e2e8f0',
            position: 'relative',
        }}>
            {/* Rank badge */}
            <div style={{
                flexShrink: 0,
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <RankIcon rank={rank || 0} size={36} />
            </div>

            {/* Name + rank label */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {firstName} {lastName}
                    {isGuest && (
                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '400', marginLeft: '6px' }}>Guest</span>
                    )}
                </p>
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {rankNames[rank] || 'Unranked'}
                </p>
            </div>

            {/* Stats mini */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>{stats?.wins || 0}</p>
                    <p style={{ fontSize: '0.55rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>W</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8', margin: 0 }}>{stats?.draws || 0}</p>
                    <p style={{ fontSize: '0.55rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>D</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#e07070', margin: 0 }}>{stats?.losses || 0}</p>
                    <p style={{ fontSize: '0.55rem', color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>L</p>
                </div>
            </div>

            {/* Remove button */}
            {onRemovePlayer && (
                <button
                    onClick={handleRemove}
                    style={{
                        flexShrink: 0,
                        background: confirmRemove ? '#e07070' : 'none',
                        border: confirmRemove ? 'none' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    title={confirmRemove ? 'Tap again to confirm' : 'Remove player'}
                >
                    <Trash2 size={16} color={confirmRemove ? '#fff' : '#94a3b8'} />
                </button>
            )}
        </div>
    );
}

export default PlayerCard;
