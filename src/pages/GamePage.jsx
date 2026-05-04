import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlay, FiPause, FiRotateCcw } from 'react-icons/fi';
import { Share2, Timer, CalendarCog } from 'lucide-react';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import { getCaptain } from '../utils/teamBalancer';
import SubTimerModal from '../components/modals/SubTimerModal';
import GoalCarousel from '../components/GoalCarousel';
import useLanguageStore from '../store/languageStore';
import GameDebtService from '../api/gameDebtService';
import AppHeaderBar from '../components/bars/AppHeaderBar';

const GamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const {
        game, subscribeToGame, loading,
        createGame, deleteGame, updateGame,
        resetGameSession, initGameSession,
        team1Goals, setTeam1Goals,
        team2Goals, setTeam2Goals,
        timer, setTimer,
        isRunning, setIsRunning,
    } = useGameStore();
    const { updateRank, group, subscribeToGroup } = useGroupStore();
    const { t } = useLanguageStore();

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [subCounts, setSubCounts] = useState({});
    const [ready, setReady] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        setReady(false);
        if (gameId) {
            // Only resets goals/timer when switching to a different game
            initGameSession(gameId);
            const unsub = subscribeToGame(gameId);
            setReady(true);
            return () => { unsub(); setReady(false); };
        }
    }, [gameId, subscribeToGame]);

    useEffect(() => {
        if (!ready || loading) return;
        if (!game) {
            const gId = group?.id;
            if (gId) navigate(`/groups/${gId}`, { replace: true });
            else navigate('/', { replace: true });
            return;
        }
        if (game.status && game.status !== 'open' && game.status !== 'confirmed') {
            navigate(`/groups/${game.groupId}`, { replace: true });
        }
    }, [game, loading, ready, group?.id, navigate]);

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
        const allPlayers = [...team1, ...team2, ...(game.injured || [])];
        const price = Number(game.price) || 0;
        const adminPlayer = (group?.players || []).find(p => group?.adminIds?.includes(p.userId) || p.userId === group?.adminId);
        const treasuryId = group?.treasuryPlayerId || adminPlayer?.id || null;
        let payments = { ...(game.payments || {}) };

        if (price > 0 && allPlayers.length > 0) {
            const perPlayerCost = price / allPlayers.length;

            // Auto-pay treasury and guests invited by treasury
            allPlayers.forEach(p => {
                if (p.id === treasuryId) payments[p.id] = true;
                if (p.guest && p.addedBy === treasuryId) payments[p.id] = true;
            });

            // Build debts map for unpaid players (guest cost goes to adder)
            const debts = {};
            allPlayers
                .filter(p => !payments[p.id] && p.id !== treasuryId)
                .forEach(p => {
                    const targetId = p.guest && p.addedBy ? p.addedBy : p.id;
                    const targetPlayer = allPlayers.find(pl => pl.id === targetId) || p;
                    const name = `${targetPlayer.firstName} ${targetPlayer.lastName?.[0] ? targetPlayer.lastName[0] + '.' : ''}`.trim();
                    debts[targetId] = {
                        name,
                        amount: Math.round(((debts[targetId]?.amount || 0) + perPlayerCost) * 100) / 100,
                        paid: false,
                    };
                });

            if (Object.keys(debts).length > 0) {
                await GameDebtService.createGameDebt({
                    groupId: group.id,
                    date: game.date || null,
                    time: game.time || null,
                    location: game.location || null,
                    price,
                    perPlayerCost: Math.round(perPlayerCost * 100) / 100,
                    createdAt: Date.now(),
                    debts,
                });
            }
        }

        if (team1Goals === team2Goals) {
            updateRank(group.id, team1, team2, true);
        } else {
            const winner = team1Goals > team2Goals ? team1 : team2;
            const loser = team1Goals > team2Goals ? team2 : team1;
            updateRank(group.id, winner, loser, false);
        }

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
                price: game.price || 0,
                payments: {},
                groupId: game.groupId,
            });
        }

        // Always delete the ended game — debts are stored on the group
        await deleteGame(game.id);
        resetGameSession();
        navigate(`/groups/${game.groupId}`);
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

    if (loading || !game) return <p>{t('loadingGame')}</p>;

    const currentTimer = timer ?? 300;
    const team1 = game.team1 || [];
    const team2 = game.team2 || [];
    const captain1 = getCaptain(team1);
    const captain2 = getCaptain(team2);
    const team1Label = captain1 ? `${captain1.firstName} Squad` : 'Team 1';
    const team2Label = captain2 ? `${captain2.firstName} Squad` : 'Team 2';

    return (
        <>
            <AppHeaderBar rightIcon={CalendarCog} onRightClick={() => navigate(`/games/${gameId}/settings`)} />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflow: 'hidden',
                padding: '12px',
            }}>
                {/* Sub Timer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    padding: '8px 0',
                    flexShrink: 0,
                }}>
                    <button onClick={toggleTimer} style={{
                        ...styles.iconBtn,
                        backgroundColor: isRunning ? '#f59e0b' : '#5b7bb3',
                    }}>
                        {isRunning ? <FiPause size={20} /> : <FiPlay size={20} />}
                    </button>
                    <p style={{ fontSize: '3.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--c-text)', margin: 0, minWidth: '140px', textAlign: 'center' }}>
                        {formatTime(currentTimer)}
                    </p>
                    <button onClick={resetTimer} style={{
                        ...styles.iconBtn,
                        backgroundColor: '#64748b',
                    }}>
                        <FiRotateCcw size={20} />
                    </button>
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
                        <GoalCarousel value={team1Goals} onChange={setTeam1Goals} color="var(--c-text)" />
                    </div>

                    {/* Divider */}
                    <div style={{ fontSize: '3rem', color: 'var(--c-border-strong)', fontWeight: 'bold' }}>:</div>

                    {/* Team 2 */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#b91c1c', marginBottom: '4px' }}>{team2Label}</p>
                        <GoalCarousel value={team2Goals} onChange={setTeam2Goals} color="var(--c-text)" />
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
                        {t('endGame')}
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
