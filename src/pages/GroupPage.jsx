import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useGameStore from '../store/gameStore';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import { Loader, Button } from 'react-bulma-components';
import GameModal from '../components/modals/GameModal'; 
import SquadHeaderBar from '../components/bars/SquadHeaderBar';
import RankIcon from '../components/RankIcon';

import { Trophy, Swords, Minus } from 'lucide-react';

const positionColors = ['#d4a817', '#a0a0a0', '#cd7f32'];

function GroupPage() {
    const { id } = useParams();
    const { group, subscribeToGroup } = useGroupStore();
    const { games, subscribeToGamesByGroup } = useGameStore();
    const { user } = useAuthStore();
    const { t } = useLanguageStore();

    const [isGameCreateModalOpen, setIsGameCreateModalOpen] = useState(false);

    const isAdmin = group && user && (group.adminIds?.includes(user.uid) || group.adminId === user.uid);

    useEffect(() => {
        console.log('[GroupPage] useEffect subscribe, id:', id);
        const unsubGroup = subscribeToGroup(id);
        subscribeToGamesByGroup(id);
        return () => { unsubGroup(); };
    }, [id, subscribeToGroup, subscribeToGamesByGroup]);

    console.log('[GroupPage] render, games:', games.map(g => ({ id: g.id, status: g.status })));

    // All players sorted by rank (desc), then wins (desc)
    const sortedPlayers = (group?.players || [])
        .map(p => ({
            ...p,
            wins: p.stats?.wins || 0,
            draws: p.stats?.draws || 0,
            losses: p.stats?.losses || 0,
            totalGames: (p.stats?.wins || 0) + (p.stats?.draws || 0) + (p.stats?.losses || 0),
        }))
        .sort((a, b) => b.rank - a.rank || b.wins - a.wins || a.losses - b.losses);

    if (!group || group.id !== id) return <Loader />;

    return (
        <>
            <SquadHeaderBar />
            <div style={{
                maxHeight: "100vh",
                overflowY: "auto",
                padding: "20px 16px 32px",
                maxWidth: "720px",
                margin: "0 auto",
                width: "100%",
            }}>
                {/* Create Game Modal */}
                <GameModal 
                    isOpen={isGameCreateModalOpen} 
                    setIsOpen={setIsGameCreateModalOpen} 
                    group={group} 
                />

                {/* Show Schedule Button only if no open games and user is admin */}
                {games.filter(g => g.status === 'open' || g.status === 'confirmed').length === 0 && isAdmin && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <Button 
                            onClick={() => setIsGameCreateModalOpen(true)} 
                            style={{
                                padding: '12px 24px',  
                                borderRadius: '15px',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                background: '#5b7bb3',
                                color: '#fff',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            {t('scheduleGame')}
                        </Button>
                    </div>
                )}

                {/* Player Leaderboard */}
                {sortedPlayers.length > 0 && (
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', textAlign: 'center', marginBottom: '16px' }}>
                            {t('leaderboard')}
                        </p>

                        {/* Header row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '28px 1fr 28px repeat(3, 32px) 44px',
                            alignItems: 'center',
                            padding: '0 12px 8px',
                            fontSize: '0.6rem',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: '600',
                        }}>
                            <span>#</span>
                            <span>{t('player')}</span>
                            <span></span>
                            <span style={{ textAlign: 'center' }}><Trophy size={10} color="#16a34a" /></span>
                            <span style={{ textAlign: 'center' }}><Minus size={10} color="#94a3b8" /></span>
                            <span style={{ textAlign: 'center' }}><Swords size={10} color="#ef4444" /></span>
                            <span style={{ textAlign: 'center', fontSize: '0.55rem' }}>Win%</span>
                        </div>

                        {/* Player rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {sortedPlayers.map((player, index) => {
                                const isTop3 = index < 3;
                                const winRate = player.totalGames > 0 ? Math.round((player.wins / player.totalGames) * 100) : 0;
                                return (
                                    <div
                                        key={player.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '28px 1fr 28px repeat(3, 32px) 44px',
                                            alignItems: 'center',
                                            background: '#fff',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            boxShadow: isTop3
                                                ? '0 2px 8px rgba(0,0,0,0.06)'
                                                : '0 1px 3px rgba(0,0,0,0.03)',
                                            border: isTop3 ? `1px solid ${positionColors[index]}30` : '1px solid #f1f5f9',
                                        }}
                                    >
                                        {/* Position */}
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: isTop3 ? positionColors[index] : '#94a3b8',
                                            width: '22px',
                                            height: '22px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            background: isTop3 ? `${positionColors[index]}18` : 'transparent',
                                        }}>
                                            {index + 1}
                                        </span>

                                        {/* Name */}
                                        <span style={{
                                            fontSize: '0.85rem',
                                            fontWeight: isTop3 ? '600' : '500',
                                            color: '#1e293b',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {player.firstName} {player.lastName?.[0] ? `${player.lastName[0]}.` : ''}
                                        </span>

                                        {/* Rank icon */}
                                        <RankIcon rank={player.rank || 0} size={22} />

                                        {/* Stats */}
                                        <span style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', color: '#16a34a' }}>{player.wins}</span>
                                        <span style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '500', color: '#94a3b8' }}>{player.draws}</span>
                                        <span style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '500', color: '#ef4444' }}>{player.losses}</span>
                                        <span style={{
                                            textAlign: 'center', fontSize: '0.75rem', fontWeight: '600',
                                            color: winRate >= 50 ? '#16a34a' : winRate > 0 ? '#64748b' : '#94a3b8',
                                        }}>
                                            {player.totalGames > 0 ? `${winRate}%` : '-'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default GroupPage;
