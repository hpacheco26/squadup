import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useGameStore from '../store/gameStore';
import { Loader, Button } from 'react-bulma-components';
import GameModal from '../components/modals/GameModal'; 
import GamesContainer from '../components/containers/GamesContainer'; 
import SquadHeaderBar from '../components/bars/SquadHeaderBar';
import RankIcon from '../components/RankIcon';

const medalIcons = ['🥇', '🥈', '🥉'];
const topBgColors = ['#fef3c7', '#f1f5f9', '#fde8d0'];

function GroupPage() {
    const { id } = useParams();
    const { group, subscribeToGroup } = useGroupStore();
    const { games, subscribeToGamesByGroup, loading, error } = useGameStore();

    const [isGameCreateModalOpen, setIsGameCreateModalOpen] = useState(false);

    useEffect(() => {
        const unsubGroup = subscribeToGroup(id);
        const unsubGames = subscribeToGamesByGroup(id);
        return () => { unsubGroup(); unsubGames(); };
    }, [id, subscribeToGroup, subscribeToGamesByGroup]);

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

    if (!group || loading || group.id !== id) return <Loader />;

    return (
        <>
            <SquadHeaderBar />
            <div className="p-4" style={{ maxHeight: "100vh", overflowY: "auto" }}>
                {/* Create Game Modal */}
                <GameModal 
                    isOpen={isGameCreateModalOpen} 
                    setIsOpen={setIsGameCreateModalOpen} 
                    group={group} 
                />

                {/* Next Game */}
                {games.length > 0 && (
                    <>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', textAlign: 'center', marginBottom: '4px' }}>
                            Next Game
                        </p>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginBottom: '8px' }}>
                            Go to PreGame to confirm your attendance
                        </p>
                    </>
                )}
                <GamesContainer games={games} readOnly />

                {/* Show Schedule Button only if no games exist */}
                {games.length === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
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
                            Schedule Game
                        </Button>
                    </div>
                )}

                {/* Player Leaderboard */}
                {sortedPlayers.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', textAlign: 'center', marginBottom: '12px' }}>
                            Leaderboard
                        </p>

                        {/* Header row */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '28px 1fr 28px repeat(4, 32px)',
                            alignItems: 'center',
                            padding: '0 12px 6px',
                            fontSize: '0.65rem',
                            color: '#94a3b8',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: '600',
                        }}>
                            <span>#</span>
                            <span>Player</span>
                            <span></span>
                            <span style={{ textAlign: 'center' }}>W</span>
                            <span style={{ textAlign: 'center' }}>D</span>
                            <span style={{ textAlign: 'center' }}>L</span>
                            <span style={{ textAlign: 'center' }}>GP</span>
                        </div>

                        {/* Player rows */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {sortedPlayers.map((player, index) => {
                                const isTop3 = index < 3;
                                return (
                                    <div
                                        key={player.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '28px 1fr 28px repeat(4, 32px)',
                                            alignItems: 'center',
                                            background: isTop3 ? topBgColors[index] : '#fff',
                                            borderRadius: '10px',
                                            padding: '10px 12px',
                                            boxShadow: isTop3
                                                ? '0 2px 8px rgba(0,0,0,0.08)'
                                                : '0 1px 3px rgba(0,0,0,0.04)',
                                            border: isTop3 ? 'none' : '1px solid #f1f5f9',
                                        }}
                                    >
                                        {/* Position */}
                                        <span style={{ fontSize: isTop3 ? '1rem' : '0.8rem', fontWeight: '600', color: '#64748b' }}>
                                            {isTop3 ? medalIcons[index] : index + 1}
                                        </span>

                                        {/* Name */}
                                        <span style={{
                                            fontSize: '0.9rem',
                                            fontWeight: isTop3 ? 'bold' : '500',
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
                                        <span style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '600', color: '#16a34a' }}>{player.wins}</span>
                                        <span style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', color: '#94a3b8' }}>{player.draws}</span>
                                        <span style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', color: '#e07070' }}>{player.losses}</span>
                                        <span style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: '500', color: '#64748b' }}>{player.totalGames}</span>
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
