import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useGameStore from '../store/gameStore';
import { Loader, Button } from 'react-bulma-components';
import GameModal from '../components/modals/GameModal'; 
import GamesContainer from '../components/containers/GamesContainer'; 
import SquadHeaderBar from '../components/bars/SquadHeaderBar';
import RankIcon from '../components/RankIcon';

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

    // Top 3 players by wins
    const topPlayers = (group?.players || [])
        .map(p => ({ ...p, wins: p.stats?.wins || 0 }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 3);

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
                    <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', textAlign: 'center', marginBottom: '8px' }}>
                        Next Game
                    </p>
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

                {/* Top 3 Podium */}
                {topPlayers.length > 0 && (
                    <div style={{ marginTop: '24px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', textAlign: 'center', marginBottom: '12px' }}>
                            Top Players
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px' }}>
                            {/* 2nd place */}
                            {topPlayers[1] ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🥈</span>
                                    <div style={{
                                        background: '#e2e8f0',
                                        borderRadius: '10px 10px 0 0',
                                        width: '80px',
                                        height: '80px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <RankIcon rank={topPlayers[1].rank || 0} size={24} />
                                        <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>{topPlayers[1].firstName}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{topPlayers[1].wins}W</p>
                                    </div>
                                </div>
                            ) : <div style={{ width: '80px' }} />}

                            {/* 1st place */}
                            {topPlayers[0] ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '2rem' }}>🥇</span>
                                    <div style={{
                                        background: '#fef3c7',
                                        borderRadius: '10px 10px 0 0',
                                        width: '90px',
                                        height: '110px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    }}>
                                        <RankIcon rank={topPlayers[0].rank || 0} size={28} />
                                        <p style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#1e293b' }}>{topPlayers[0].firstName}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{topPlayers[0].wins}W</p>
                                    </div>
                                </div>
                            ) : null}

                            {/* 3rd place */}
                            {topPlayers[2] ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.3rem' }}>🥉</span>
                                    <div style={{
                                        background: '#fde8d0',
                                        borderRadius: '10px 10px 0 0',
                                        width: '75px',
                                        height: '60px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <RankIcon rank={topPlayers[2].rank || 0} size={20} />
                                        <p style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#1e293b' }}>{topPlayers[2].firstName}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#64748b' }}>{topPlayers[2].wins}W</p>
                                    </div>
                                </div>
                            ) : <div style={{ width: '75px' }} />}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default GroupPage;
