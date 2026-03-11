import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { balanceTeams, getCaptain } from '../utils/teamBalancer';
import PlayerCardMini from '../components/cards/PlayerCardMini';
import SwipeTeamPlayer from '../components/SwipeTeamPlayer';
import useGameStore from '../store/gameStore';
import GameHeaderBar from '../components/bars/GameHeaderBar';

const getPlayerStatus = (index) => {
    if (index < 4) return '⚽️';
    if (index === 4) return '🧤';
    return '🏖️';
};

const TeamsPage = () => {
    const { gameId } = useParams();
    const { game, subscribeToGame, updateGame, loading } = useGameStore();
    const [pressed, setPressed] = useState(false);
    const [shuffling, setShuffling] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        if (gameId) {
            const unsub = subscribeToGame(gameId);
            return unsub;
        }
    }, [gameId, subscribeToGame]);

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

    if (!game && loading) {
        return <p>Loading teams...</p>;
    }

    if (!game) {
        return <p>Loading teams...</p>;
    }

    const playersIn = game.playersIn || [];
    const hasTeams = game.team1?.length > 0 || game.team2?.length > 0;
    const captain1 = getCaptain(game.team1);
    const captain2 = getCaptain(game.team2);

    return (
        <>
            <GameHeaderBar gameId={gameId} />
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
                                        />
                                    </div>
                                ))}
                            </div>

                            <hr style={{ margin: '8px 0', borderTop: '3px solid #ccc' }} />

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
                                        />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={handleSquadUp}
                    onPointerDown={() => setPressed(true)}
                    onPointerUp={() => setPressed(false)}
                    onPointerLeave={() => setPressed(false)}
                    style={{
                        padding: '14px 24px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: pressed ? '#4a6694' : '#5b7bb3',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        boxShadow: pressed ? '0 1px 2px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        transform: pressed ? 'scale(0.96)' : 'scale(1)',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease, background-color 0.1s ease',
                    }}
                >
                    Squad Up
                </button>
            </div>
        </>
    );
};

export default TeamsPage;
