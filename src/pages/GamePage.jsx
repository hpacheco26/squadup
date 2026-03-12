import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlay, FiPause, FiRotateCcw } from 'react-icons/fi';
import { Share2, Timer } from 'lucide-react';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import { getCaptain } from '../utils/teamBalancer';
import { FiSettings } from 'react-icons/fi';
import GameModal from '../components/modals/GameModal';
import SubTimerModal from '../components/modals/SubTimerModal';
import GoalCarousel from '../components/GoalCarousel';

const GamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const {
        game, subscribeToGame, loading,
        createGame, deleteGame,
        team1Goals, setTeam1Goals,
        team2Goals, setTeam2Goals,
        timer, setTimer,
        isRunning, setIsRunning,
    } = useGameStore();
    const { updateRank, group, subscribeToGroup } = useGroupStore();

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const [subCounts, setSubCounts] = useState({});
    const intervalRef = useRef(null);

    useEffect(() => {
        if (gameId) {
            const unsub = subscribeToGame(gameId);
            return unsub;
        }
    }, [gameId, subscribeToGame]);

    useEffect(() => {
        if (game?.groupId) {
            const unsub = subscribeToGroup(game.groupId);
            return unsub;
        }
    }, [game?.groupId, subscribeToGroup]);

    // Set initial timer from game settings (only if timer hasn't been initialized)
    useEffect(() => {
        if (game?.subTime && timer === null) {
            setTimer(game.subTime * 60);
        }
    }, [game?.subTime]);

    // Timer countdown — use ref-based interval to avoid stale closures
    const stopInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isRunning) {
            stopInterval();
            intervalRef.current = setInterval(() => {
                const state = useGameStore.getState();
                const current = state.timer ?? 300;
                if (current <= 1) {
                    state.setTimer(0);
                    state.setIsRunning(false);
                    setIsSubModalOpen(true);
                } else {
                    state.setTimer(current - 1);
                }
            }, 1000);
        } else {
            stopInterval();
        }
        return stopInterval;
    }, [isRunning, stopInterval]);

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setIsRunning(false);
        setTimer((game?.subTime || 5) * 60);
    };

    const handleSubstitution = ({ team1PlayerId, team2PlayerId }) => {
        setIsSubModalOpen(false);

        // Rotate selected players to end of their team arrays
        const currentGame = useGameStore.getState().game;
        if (currentGame) {
            const rotatePlayer = (team, playerId) => {
                if (!playerId || !team?.length) return team;
                const idx = team.findIndex(p => p.id === playerId);
                if (idx === -1) return team;
                const newTeam = [...team];
                const [player] = newTeam.splice(idx, 1);
                newTeam.push(player);
                return newTeam;
            };

            const newTeam1 = rotatePlayer(currentGame.team1, team1PlayerId);
            const newTeam2 = rotatePlayer(currentGame.team2, team2PlayerId);

            const { updateGame } = useGameStore.getState();
            updateGame(currentGame.id, { team1: newTeam1, team2: newTeam2 });
        }

        // Track sub counts
        setSubCounts(prev => {
            const next = { ...prev };
            if (team1PlayerId) next[team1PlayerId] = (next[team1PlayerId] || 0) + 1;
            if (team2PlayerId) next[team2PlayerId] = (next[team2PlayerId] || 0) + 1;
            return next;
        });

        resetTimer();
    };

    const formatTime = (time) => {
        const m = Math.floor(time / 60);
        const s = time % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleEndGame = async () => {
        const winner = team1Goals >= team2Goals ? team1 : team2;
        const loser = team1Goals >= team2Goals ? team2 : team1;
        updateRank(group.id, winner, loser);

        if (game.recurrence && game.recurrence !== 'none') {
            // Create next recurring game
            const currentDate = new Date(`${game.date}T${game.time || '00:00'}`);
            if (game.recurrence === 'weekly') {
                currentDate.setDate(currentDate.getDate() + 7);
            } else if (game.recurrence === 'monthly') {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            const nextDate = currentDate.toISOString().split('T')[0];
            const nextTime = game.time;

            await createGame({
                status: 'open',
                date: nextDate,
                time: nextTime,
                location: game.location,
                maxPlayers: game.maxPlayers,
                minPlayers: game.minPlayers,
                playersInvited: group?.players || game.playersInvited || [],
                playersIn: [],
                playersOut: [],
                teamA: [],
                teamB: [],
                subTime: game.subTime,
                recurrence: game.recurrence,
                groupId: game.groupId,
            });
        }

        // Delete the finished game
        await deleteGame(game.id);
        navigate('/rank');
    };

    const handleShareResult = () => {
        const team1Names = team1.map(p => p.firstName).join(', ');
        const team2Names = team2.map(p => p.firstName).join(', ');
        const groupName = group?.name || 'Game';
        let msg = `⚽ ${groupName} — Result\n\n`;
        msg += `${team1Label}: ${team1Goals}\n`;
        msg += `${team2Label}: ${team2Goals}\n\n`;
        msg += `🟢 ${team1Label}: ${team1Names}\n`;
        msg += `🔴 ${team2Label}: ${team2Names}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    if (loading || !game) return <p>Loading game...</p>;

    const currentTimer = timer ?? 300;
    const team1 = game.team1 || [];
    const team2 = game.team2 || [];
    const captain1 = getCaptain(team1);
    const captain2 = getCaptain(team2);
    const team1Label = captain1 ? `${captain1.firstName} Squad` : 'Team 1';
    const team2Label = captain2 ? `${captain2.firstName} Squad` : 'Team 2';

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
                    <Timer size={20} color="#5b7bb3" />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        {group?.name || 'Game'}
                    </h1>
                </div>
                <button onClick={() => setIsGameModalOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#94a3b8' }} aria-label="Game Settings">
                    <FiSettings size={22} />
                </button>
            </header>
            <GameModal isOpen={isGameModalOpen} setIsOpen={setIsGameModalOpen} group={group} game={game} />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                padding: '12px',
            }}>
                {/* Sub Timer */}
                <div style={{ textAlign: 'center', padding: '8px 0', flexShrink: 0 }}>
                    <p style={{ fontSize: '3.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: '#0f1d2f' }}>
                        {formatTime(currentTimer)}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                        <button onClick={toggleTimer} style={{
                            ...styles.iconBtn,
                            backgroundColor: isRunning ? '#f59e0b' : '#5b7bb3',
                        }}>
                            {isRunning ? <FiPause size={20} /> : <FiPlay size={20} />}
                        </button>
                        <button onClick={resetTimer} style={{
                            ...styles.iconBtn,
                            backgroundColor: '#64748b',
                        }}>
                            <FiRotateCcw size={20} />
                        </button>
                    </div>
                </div>

                {/* Score Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    flex: 1,
                    marginTop: '-20px',
                }}>
                    {/* Team 1 */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0d9488', marginBottom: '4px' }}>{team1Label}</p>
                        <GoalCarousel value={team1Goals} onChange={setTeam1Goals} color="#0f1d2f" />
                    </div>

                    {/* Divider */}
                    <div style={{ fontSize: '3rem', color: '#cbd5e1', fontWeight: 'bold' }}>:</div>

                    {/* Team 2 */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#b91c1c', marginBottom: '4px' }}>{team2Label}</p>
                        <GoalCarousel value={team2Goals} onChange={setTeam2Goals} color="#0f1d2f" />
                    </div>
                </div>

                {/* End Game Button */}
                <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                    <button
                        onClick={handleShareResult}
                        style={{
                            padding: '14px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            backgroundColor: '#4CAF7D',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Share2 size={20} />
                    </button>
                    <button
                        onClick={handleEndGame}
                        style={{
                            padding: '14px 24px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: '#fff',
                            backgroundColor: '#5b7bb3',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            flex: 1,
                        }}
                    >
                        End Game
                    </button>
                </div>
            </div>

            {/* Sub Timer Modal */}
            <SubTimerModal
                team1={team1}
                team2={team2}
                team1Label={team1Label}
                team2Label={team2Label}
                subCounts={subCounts}
                isOpen={isSubModalOpen}
                onClose={() => setIsSubModalOpen(false)}
                onAcceptSub={handleSubstitution}
            />


        </>
    );
};

const styles = {
    iconBtn: {
        width: '48px',
        height: '48px',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
};

export default GamePage;
