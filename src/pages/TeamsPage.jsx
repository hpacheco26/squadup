import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { balanceTeams, getCaptain } from '../utils/teamBalancer';
import PlayerCardMini from '../components/cards/PlayerCardMini';
import SwipeTeamPlayer from '../components/SwipeTeamPlayer';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import { FiSettings } from 'react-icons/fi';
import { TbBallFootball, TbHandStop, TbBottle } from 'react-icons/tb';
import { ShieldBan, Shuffle, Swords } from 'lucide-react';
import GameModal from '../components/modals/GameModal';

const iconStyle = { color: '#94a3b8', flexShrink: 0 };
const getPlayerStatus = (index) => {
    if (index < 4) return <TbBallFootball size={16} style={iconStyle} />;
    if (index === 4) return <TbHandStop size={16} style={iconStyle} />;
    return <TbBottle size={16} style={iconStyle} />;
};

const TeamsPage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { game, subscribeToGame, updateGame, loading } = useGameStore();
    const { group, subscribeToGroup } = useGroupStore();
    const [pressed, setPressed] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [shuffling, setShuffling] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (gameId) {
            const unsub = subscribeToGame(gameId);
            return unsub;
        }
    }, [gameId, subscribeToGame]);

    useEffect(() => {
        if (game?.status === 'ended' && game.groupId) {
            navigate(`/groups/${game.groupId}`, { replace: true });
        }
    }, [game?.status, game?.groupId, navigate]);

    useEffect(() => {
        if (game?.groupId) {
            const unsub = subscribeToGroup(game.groupId);
            return unsub;
        }
    }, [game?.groupId, subscribeToGroup]);

    const handleSquadUp = async () => {
        if (game?.playersIn?.length > 0) {
            setShuffling(true);
            setAnimateIn(false);
            await new Promise(r => setTimeout(r, 700));
            const { team1, team2 } = balanceTeams(game.playersIn);
            await updateGame(gameId, { team1, team2 });
            setShuffling(false);
            setAnimateIn(true);
            setTimeout(() => setAnimateIn(false), 800);
        }
    };

    const hurricaneStyle = (i, total) => {
        const angle = (360 / total) * i;
        const rad = angle * (Math.PI / 180);
        const radius = 60;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const spin = 360 + angle;
        return {
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
            transform: shuffling
                ? `translate(${x}px, ${y}px) rotate(${spin}deg) scale(0.7)`
                : 'translate(0, 0) rotate(0deg) scale(1)',
            opacity: shuffling ? 0.3 : 1,
        };
    };

    const settleStyle = (index, direction) => {
        const delay = index * 0.06;
        return {
            transition: `transform ${0.4 + delay}s cubic-bezier(0.34, 1.56, 0.64, 1), opacity ${0.3 + delay}s ease`,
            transform: animateIn
                ? 'translateY(0) rotate(0deg) scale(1)'
                : (shuffling ? `translateY(${direction * 50}px) rotate(${direction * 180}deg) scale(0.5)` : 'translateY(0) rotate(0deg) scale(1)'),
            opacity: shuffling ? 0 : 1,
        };
    };

    const handleSwapPlayer = async (playerId, fromTeam) => {
        const currentGame = useGameStore.getState().game;
        const sourceList = fromTeam === 'team1' ? [...currentGame.team1] : [...currentGame.team2];
        const targetList = fromTeam === 'team1' ? [...currentGame.team2] : [...currentGame.team1];

        const playerIndex = sourceList.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const [player] = sourceList.splice(playerIndex, 1);
        targetList.push(player);

        const updatedTeams = {
            team1: fromTeam === 'team1' ? sourceList : targetList,
            team2: fromTeam === 'team2' ? sourceList : targetList,
        };

        await updateGame(gameId, updatedTeams);
    };

    const handleInjury = async (playerId, fromTeam) => {
        const currentGame = useGameStore.getState().game;
        const teamList = fromTeam === 'team1' ? [...currentGame.team1] : [...currentGame.team2];
        const playerIndex = teamList.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const [player] = teamList.splice(playerIndex, 1);
        const injured = [...(currentGame.injured || []), { ...player, fromTeam }];

        await updateGame(gameId, { [fromTeam]: teamList, injured });
    };

    const handleRecover = async (playerId) => {
        const currentGame = useGameStore.getState().game;
        const injuredList = [...(currentGame.injured || [])];
        const playerIndex = injuredList.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const [player] = injuredList.splice(playerIndex, 1);
        const { fromTeam, ...cleanPlayer } = player;
        const targetTeam = fromTeam || 'team1';
        const teamList = [...(currentGame[targetTeam] || []), cleanPlayer];

        await updateGame(gameId, { [targetTeam]: teamList, injured: injuredList });
    };

    if (!game && loading) {
        return <p>Loading teams...</p>;
    }

    if (!game) {
        return <p>Loading teams...</p>;
    }

    if (game.status === 'ended') return null;

    const playersIn = game.playersIn || [];
    const hasTeams = game.team1?.length > 0 || game.team2?.length > 0;
    const captain1 = getCaptain(game.team1);
    const captain2 = getCaptain(game.team2);

    return (
        <>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Swords size={20} color="#5b7bb3" />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        {group?.name || 'Teams'}
                    </h1>
                    {hasTeams && (
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: '600',
                            color: '#64748b',
                            background: '#f1f5f9',
                            borderRadius: '10px',
                            padding: '2px 8px',
                        }}>
                            {(game.team1?.length || 0) + (game.team2?.length || 0)} players
                        </span>
                    )}
                </div>
                <button onClick={() => setIsGameModalOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#94a3b8' }} aria-label="Game Settings">
                    <FiSettings size={22} />
                </button>
            </header>
            <GameModal isOpen={isGameModalOpen} setIsOpen={setIsGameModalOpen} group={group} game={game} />
            <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflowY: shuffling ? 'hidden' : 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                    {!hasTeams ? (
                        <>
                            {playersIn.map((player, i) => (
                                <div
                                    key={player.id}
                                    style={hurricaneStyle(i, playersIn.length)}
                                >
                                    <PlayerCardMini player={player} />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <div>
                                {game.team1.map((player, index) => (
                                    <div
                                        key={player.id}
                                        style={settleStyle(index, -1)}
                                    >
                                        <SwipeTeamPlayer
                                            player={player}
                                            status={getPlayerStatus(index)}
                                            team="team1"
                                            isCaptain={captain1?.id === player.id}
                                            onSwipe={() => handleSwapPlayer(player.id, 'team1')}
                                            onInjury={() => handleInjury(player.id, 'team1')}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 8px' }}>
                                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #0d9488, transparent)' }} />
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600', letterSpacing: '0.5px' }}>VS</span>
                                <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, #e11d48, transparent)' }} />
                            </div>

                            <div>
                                {game.team2.map((player, index) => (
                                    <div
                                        key={player.id}
                                        style={settleStyle(index, 1)}
                                    >
                                        <SwipeTeamPlayer
                                            player={player}
                                            status={getPlayerStatus(index)}
                                            team="team2"
                                            isCaptain={captain2?.id === player.id}
                                            onSwipe={() => handleSwapPlayer(player.id, 'team2')}
                                            onInjury={() => handleInjury(player.id, 'team2')}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Injured section */}
                            {(game.injured?.length > 0) && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 8px' }}>
                                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to right, #f59e0b, transparent)' }} />
                                        <ShieldBan size={12} color="#f59e0b" strokeWidth={2.5} />
                                        <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: '600', letterSpacing: '0.5px' }}>INJURED</span>
                                        <ShieldBan size={12} color="#f59e0b" strokeWidth={2.5} />
                                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(to left, #f59e0b, transparent)' }} />
                                    </div>
                                    <div>
                                        {game.injured.map((player) => (
                                            <SwipeTeamPlayer
                                                key={player.id}
                                                player={player}
                                                mode="injured"
                                                onRecover={() => handleRecover(player.id)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={handleSquadUp}
                    onPointerDown={() => setPressed(true)}
                    onPointerUp={() => setPressed(false)}
                    onPointerLeave={() => setPressed(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '14px 24px',
                        fontSize: '1rem',
                        fontWeight: '700',
                        color: '#fff',
                        background: pressed
                            ? 'linear-gradient(135deg, #4a6694, #3d5580)'
                            : 'linear-gradient(135deg, #5b7bb3, #4a6694)',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: pressed
                            ? '0 1px 3px rgba(91,123,179,0.3)'
                            : '0 4px 12px rgba(91,123,179,0.35)',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        transform: pressed ? 'scale(0.97)' : 'scale(1)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                >
                    <Shuffle size={18} strokeWidth={2.5} />
                    Squad Up
                </button>
            </div>
        </>
    );
};

export default TeamsPage;
