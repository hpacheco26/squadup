import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';
import GameService from '../api/gameService';
import GroupService from '../api/groupService';

function GameInvitePage() {
    const { gameId } = useParams();
    const [game, setGame] = useState(null);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [respondedPlayerId, setRespondedPlayerId] = useState(null);
    const [respondedStatus, setRespondedStatus] = useState(null);

    // Load game data with anonymous auth
    useEffect(() => {
        async function load() {
            try {
                // Sign in anonymously so Firestore rules pass
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }
                const gameData = await GameService.getGameById(gameId);
                if (!gameData) {
                    setError('This game has ended or no longer exists.');
                    setLoading(false);
                    return;
                }
                setGame(gameData);

                if (gameData.groupId) {
                    const grp = await GroupService.getGroupById(gameData.groupId);
                    setGroup(grp);
                }

                // Check localStorage for prior response
                const stored = localStorage.getItem(`game-response-${gameId}`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setRespondedPlayerId(parsed.playerId);
                    setRespondedStatus(parsed.status);
                }
            } catch (err) {
                console.error('Failed to load game invite:', err);
                setError('Failed to load game');
            }
            setLoading(false);
        }
        load();
    }, [gameId]);

    const handleResponse = async (player, status) => {
        if (!game) return;

        let updatedIn = [...(game.playersIn || [])];
        let updatedOut = [...(game.playersOut || [])];
        let updatedInvited = [...(game.playersInvited || [])];

        // Remove player from all lists first
        updatedIn = updatedIn.filter(p => p.id !== player.id);
        updatedOut = updatedOut.filter(p => p.id !== player.id);
        updatedInvited = updatedInvited.filter(p => p.id !== player.id);

        // Add to appropriate list
        if (status === 'in') {
            updatedIn.push(player);
        } else {
            updatedOut.push(player);
        }

        const updates = {
            playersIn: updatedIn,
            playersOut: updatedOut,
            playersInvited: updatedInvited,
        };

        await GameService.updateGame(gameId, updates);

        // Update local state
        setGame(prev => ({ ...prev, ...updates }));
        setRespondedPlayerId(player.id);
        setRespondedStatus(status);

        // Save to localStorage to prevent re-swiping
        localStorage.setItem(`game-response-${gameId}`, JSON.stringify({
            playerId: player.id,
            status,
        }));
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <p style={styles.message}>Loading game...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>Oops</p>
                    <p style={styles.subtitle}>{error}</p>
                </div>
            </div>
        );
    }

    // Check if user already responded
    if (respondedPlayerId) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>{group?.name || 'Game'}</p>
                    <GameInfo game={game} />
                    <div style={{ marginTop: '20px', padding: '16px', borderRadius: '10px', background: respondedStatus === 'in' ? '#dcfce7' : '#fee2e2' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: respondedStatus === 'in' ? '#16a34a' : '#ef4444' }}>
                            {respondedStatus === 'in' ? '✅ You\'re IN!' : '❌ You\'re OUT'}
                        </p>
                    </div>
                    <PlayerSummary game={game} />
                </div>
            </div>
        );
    }

    // Show player list for swiping
    const invitedPlayers = game.playersInvited || [];

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <p style={styles.title}>{group?.name || 'Game'}</p>
                <GameInfo game={game} />

                {invitedPlayers.length > 0 && (
                    <>
                        <p style={{ ...styles.subtitle, marginTop: '20px' }}>Find your name and respond:</p>
                        <div style={styles.playerList}>
                            {invitedPlayers.map(player => (
                                <InvitePlayerCard
                                    key={player.id}
                                    player={player}
                                    onIn={() => handleResponse(player, 'in')}
                                    onOut={() => handleResponse(player, 'out')}
                                />
                            ))}
                        </div>
                    </>
                )}

                <PlayerSummary game={game} />
            </div>
        </div>
    );
}

function GameInfo({ game }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#64748b', fontSize: '0.9rem' }}>
            {game.date && <p>📅 {formatDate(game.date)}{game.time ? ` at ${game.time}` : ''}</p>}
            {game.location && <p>📍 {game.location}</p>}
        </div>
    );
}

function PlayerSummary({ game }) {
    const inCount = (game.playersIn || []).length;
    const outCount = (game.playersOut || []).length;
    const pendingCount = (game.playersInvited || []).length;

    return (
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '0.85rem', color: '#64748b' }}>
            <span>✅ {inCount} in</span>
            <span>❌ {outCount} out</span>
            <span>❓ {pendingCount} pending</span>
        </div>
    );
}

function InvitePlayerCard({ player, onIn, onOut }) {
    const [startX, setStartX] = useState(null);
    const [translateX, setTranslateX] = useState(0);
    const [width, setWidth] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            setWidth(ref.current.getBoundingClientRect().width);
        }
    }, []);

    function handleStart(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setStartX(clientX);
    }

    function handleMove(e) {
        if (startX === null) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const delta = clientX - startX;
        const pct = Math.ceil((delta / width) * 100);
        setTranslateX(Math.min(Math.max(pct, -25), 25));
    }

    function handleEnd() {
        if (translateX >= 25) onIn();
        if (translateX <= -25) onOut();
        setStartX(null);
        setTranslateX(0);
    }

    return (
        <div ref={ref} style={cardStyles.root}>
            <div
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
                onMouseUp={handleEnd}
                onTouchEnd={handleEnd}
                style={{
                    ...cardStyles.item,
                    transform: `translateX(${translateX}%)`,
                    transition: startX === null ? '0.2s ease' : 'none',
                }}
            >
                <span style={{ paddingLeft: '20px', fontSize: '1rem' }}>{player.firstName} {player.lastName}</span>
                <span style={{ position: 'absolute', right: '16px', color: '#94a3b8', fontSize: '1.5rem', fontWeight: 'bold' }}>?</span>
            </div>
            <div style={cardStyles.leftSide}>✅</div>
            <div style={cardStyles.rightSide}>❌</div>
        </div>
    );
}

const cardStyles = {
    root: {
        height: '56px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
    },
    item: {
        backgroundColor: '#fff',
        width: '100%',
        height: '100%',
        borderRadius: '12px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        cursor: 'grab',
        border: '1px solid #e2e8f0',
    },
    leftSide: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '50%',
        height: '100%',
        backgroundColor: '#4ade80',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '16px',
        fontSize: '1.5rem',
    },
    rightSide: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        backgroundColor: '#f87171',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '16px',
        fontSize: '1.5rem',
    },
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: '20px',
        paddingTop: '40px',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        padding: '24px 20px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#64748b',
        marginBottom: '12px',
    },
    message: {
        fontSize: '1rem',
        color: '#64748b',
    },
    playerList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '8px',
    },
};

export default GameInvitePage;
