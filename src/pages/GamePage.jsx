import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPlay, FiPause, FiRotateCcw } from 'react-icons/fi';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import { getCaptain } from '../utils/teamBalancer';
import GameHeaderBar from '../components/bars/GameHeaderBar';
import SubTimerModal from '../components/modals/SubTimerModal';
import GoalCarousel from '../components/GoalCarousel';

const GamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const {
        game, fetchGameById, loading,
        createGame, deleteGame,
        team1Goals, setTeam1Goals,
        team2Goals, setTeam2Goals,
        timer, setTimer,
        isRunning, setIsRunning,
    } = useGameStore();
    const { updateRank, group } = useGroupStore();

    const [isSubModalOpen, setIsSubModalOpen] = useState(false);

    useEffect(() => {
        if (gameId) fetchGameById(gameId);
    }, [gameId, fetchGameById]);

    // Set initial timer from game settings (only if timer hasn't been initialized)
    useEffect(() => {
        if (game?.subTime && timer === null) {
            setTimer(game.subTime * 60);
        }
    }, [game?.subTime]);

    // Timer countdown
    const currentTimer = timer ?? 300;
    useEffect(() => {
        let interval;
        if (isRunning && currentTimer > 0) {
            interval = setInterval(() => setTimer(prev => prev - 1), 1000);
        } else if (currentTimer === 0 && isRunning) {
            setIsRunning(false);
            setIsSubModalOpen(true);
        }
        return () => clearInterval(interval);
    }, [isRunning, currentTimer]);

    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => {
        setIsRunning(false);
        setTimer((game?.subTime || 5) * 60);
    };

    const handleSubstitution = () => {
        setIsSubModalOpen(false);
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

    if (loading || !game) return <p>Loading game...</p>;

    const team1 = game.team1 || [];
    const team2 = game.team2 || [];
    const captain1 = getCaptain(team1);
    const captain2 = getCaptain(team2);
    const team1Label = captain1 ? `${captain1.firstName} Squad` : 'Team 1';
    const team2Label = captain2 ? `${captain2.firstName} Squad` : 'Team 2';

    return (
        <>
            <GameHeaderBar gameId={gameId} />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 52px)',
                overflow: 'hidden',
                padding: '12px',
            }}>
                {/* Sub Timer */}
                <div style={{ textAlign: 'center', padding: '8px 0', flexShrink: 0 }}>
                    <p style={{ fontSize: '3.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
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
                        <GoalCarousel value={team1Goals} onChange={setTeam1Goals} color="#0d9488" />
                    </div>

                    {/* Divider */}
                    <div style={{ fontSize: '3rem', color: '#cbd5e1', fontWeight: 'bold' }}>:</div>

                    {/* Team 2 */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#b91c1c', marginBottom: '4px' }}>{team2Label}</p>
                        <GoalCarousel value={team2Goals} onChange={setTeam2Goals} color="#b91c1c" />
                    </div>
                </div>

                {/* End Game Button */}
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
                        flexShrink: 0,
                    }}
                >
                    End Game
                </button>
            </div>

            {/* Sub Timer Modal */}
            <SubTimerModal
                team1={team1}
                team2={team2}
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
