import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';
import GameService from '../api/gameService';
import GroupService from '../api/groupService';
import useLanguageStore from '../store/languageStore';
import theme from '../theme';

function GameInvitePage() {
    const { gameId } = useParams();
    const { t } = useLanguageStore();
    const [game, setGame] = useState(null);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [respondedPlayerId, setRespondedPlayerId] = useState(null);
    const [respondedStatus, setRespondedStatus] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [showGuestInput, setShowGuestInput] = useState(false);
    const [guestSubmitting, setGuestSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                }
                const gameData = await GameService.getGameById(gameId);
                if (!gameData) {
                    setError(t('gameEndedOrGone'));
                    setLoading(false);
                    return;
                }
                setGame(gameData);

                if (gameData.groupId) {
                    const grp = await GroupService.getGroupById(gameData.groupId);
                    setGroup(grp);
                }

                const stored = localStorage.getItem(`game-response-${gameId}`);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setRespondedPlayerId(parsed.playerId);
                    setRespondedStatus(parsed.status);
                }
            } catch (err) {
                console.error('Failed to load game invite:', err);
                setError(t('failedToLoadGame'));
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

        updatedIn = updatedIn.filter(p => p.id !== player.id);
        updatedOut = updatedOut.filter(p => p.id !== player.id);
        updatedInvited = updatedInvited.filter(p => p.id !== player.id);

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
        setGame(prev => ({ ...prev, ...updates }));
        setRespondedPlayerId(player.id);
        setRespondedStatus(status);
        localStorage.setItem(`game-response-${gameId}`, JSON.stringify({
            playerId: player.id,
            status,
        }));
    };

    const handleGuestJoin = async () => {
        const trimmed = guestName.trim();
        if (!trimmed || !game) return;
        setGuestSubmitting(true);

        const parts = trimmed.split(/\s+/);
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || '';
        const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const guestPlayer = {
            id: guestId,
            firstName,
            lastName,
            userId: null,
            rank: 0,
            stats: { gamesPlayed: 0, gamesWon: 0 },
            isGuest: true,
        };

        const updatedIn = [...(game.playersIn || []), guestPlayer];
        const updates = { playersIn: updatedIn };

        try {
            await GameService.updateGame(gameId, updates);
            setGame(prev => ({ ...prev, ...updates }));
            setRespondedPlayerId(guestId);
            setRespondedStatus('in');
            localStorage.setItem(`game-response-${gameId}`, JSON.stringify({
                playerId: guestId,
                status: 'in',
            }));
        } catch (err) {
            console.error('Failed to join as guest:', err);
        }
        setGuestSubmitting(false);
    };

    // --- Loading state ---
    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.spinner} />
                    <p style={styles.loadingText}>{t('loadingGame')}</p>
                </div>
            </div>
        );
    }

    // --- Error state ---
    if (error) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <div style={styles.errorIcon}>⚠️</div>
                    <p style={{ ...styles.heading, color: theme.danger }}>{t('oops')}</p>
                    <p style={styles.subtitle}>{error}</p>
                </div>
            </div>
        );
    }

    // --- Already responded ---
    if (respondedPlayerId) {
        const isIn = respondedStatus === 'in';
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <BrandHeader groupName={group?.name} />
                    <GameInfo game={game} t={t} />
                    <div style={{
                        ...styles.responseBanner,
                        background: isIn ? theme.successLight : theme.dangerLight,
                        borderLeft: `4px solid ${isIn ? theme.success : theme.danger}`,
                    }}>
                        <span style={{ fontSize: '1.8rem' }}>{isIn ? '✅' : '❌'}</span>
                        <p style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: isIn ? theme.success : theme.danger,
                        }}>
                            {isIn ? t('youreInGame') : t('youreOut')}
                        </p>
                    </div>
                    <PlayerSummary game={game} t={t} />
                </div>
            </div>
        );
    }

    // --- Main invite view ---
    const invitedPlayers = game.playersInvited || [];

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <BrandHeader groupName={group?.name} />
                <GameInfo game={game} t={t} />

                {invitedPlayers.length > 0 && (
                    <div style={styles.section}>
                        <p style={styles.sectionTitle}>{t('findYourName')}</p>
                        <p style={styles.swipeHint}>{t('swipeHint')}</p>
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
                    </div>
                )}

                {/* Guest join section */}
                <div style={styles.guestSection}>
                    {!showGuestInput ? (
                        <button
                            onClick={() => setShowGuestInput(true)}
                            style={styles.guestToggle}
                        >
                            {t('notOnTheList')}
                        </button>
                    ) : (
                        <div style={styles.guestForm}>
                            <p style={styles.guestLabel}>{t('enterYourName')}</p>
                            <input
                                type="text"
                                value={guestName}
                                onChange={e => setGuestName(e.target.value)}
                                placeholder={t('namePlaceholder')}
                                maxLength={40}
                                style={styles.guestInput}
                            />
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => { setShowGuestInput(false); setGuestName(''); }}
                                    style={styles.guestCancelBtn}
                                >
                                    {t('cancelGuest')}
                                </button>
                                <button
                                    onClick={handleGuestJoin}
                                    disabled={!guestName.trim() || guestSubmitting}
                                    style={{
                                        ...styles.guestJoinBtn,
                                        background: guestName.trim() ? theme.primary : theme.borderDark,
                                        cursor: guestName.trim() ? 'pointer' : 'default',
                                        opacity: guestSubmitting ? 0.6 : 1,
                                    }}
                                >
                                    {guestSubmitting ? '...' : t('imIn')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <PlayerSummary game={game} t={t} />
            </div>
        </div>
    );
}

/* ── Sub-components ── */

function BrandHeader({ groupName }) {
    return (
        <div style={styles.brandHeader}>
            <div style={styles.logoCircle}>⚽</div>
            <p style={styles.heading}>{groupName || 'SquadUp'}</p>
        </div>
    );
}

function GameInfo({ game, t }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    const hasDate = game.date;
    const hasLocation = game.location;
    if (!hasDate && !hasLocation) return null;

    return (
        <div style={styles.gameInfoRow}>
            {hasDate && (
                <div style={styles.infoPill}>
                    <span>📅</span>
                    <span>{formatDate(game.date)}{game.time ? ` · ${game.time}` : ''}</span>
                </div>
            )}
            {hasLocation && (
                <div style={styles.infoPill}>
                    <span>📍</span>
                    <span>{game.location}</span>
                </div>
            )}
        </div>
    );
}

function PlayerSummary({ game, t }) {
    const inCount = (game.playersIn || []).length;
    const outCount = (game.playersOut || []).length;
    const pendingCount = (game.playersInvited || []).length;

    return (
        <div style={styles.summaryRow}>
            <div style={{ ...styles.summaryPill, background: theme.successLight, color: theme.success }}>
                <span style={{ fontWeight: '700' }}>{inCount}</span> {t('inCount')}
            </div>
            <div style={{ ...styles.summaryPill, background: theme.dangerLight, color: theme.danger }}>
                <span style={{ fontWeight: '700' }}>{outCount}</span> {t('outCount')}
            </div>
            <div style={{ ...styles.summaryPill, background: theme.warningLight, color: theme.warning }}>
                <span style={{ fontWeight: '700' }}>{pendingCount}</span> {t('pendingCount')}
            </div>
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

    const progress = Math.abs(translateX) / 25;

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
                    borderColor: translateX > 5 ? theme.success
                        : translateX < -5 ? theme.danger
                        : theme.border,
                }}
            >
                <div style={cardStyles.avatar}>
                    {player.firstName?.[0]?.toUpperCase() || '?'}
                </div>
                <span style={cardStyles.name}>{player.firstName} {player.lastName}</span>
                <span style={cardStyles.arrows}>⟵ ⟶</span>
            </div>
            <div style={{ ...cardStyles.leftSide, opacity: translateX > 0 ? progress : 0 }}>✅</div>
            <div style={{ ...cardStyles.rightSide, opacity: translateX < 0 ? progress : 0 }}>❌</div>
        </div>
    );
}

/* ── Styles ── */

const cardStyles = {
    root: {
        height: '60px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '14px',
    },
    item: {
        backgroundColor: theme.surface,
        width: '100%',
        height: '100%',
        borderRadius: '14px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'relative',
        cursor: 'grab',
        border: `1.5px solid ${theme.border}`,
        paddingLeft: '12px',
        paddingRight: '12px',
        boxSizing: 'border-box',
        userSelect: 'none',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: theme.primaryLight,
        color: theme.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '0.9rem',
        flexShrink: 0,
    },
    name: {
        fontSize: '0.95rem',
        fontWeight: '600',
        color: theme.text,
        flex: 1,
        textAlign: 'left',
    },
    arrows: {
        color: theme.textMuted,
        fontSize: '0.8rem',
        flexShrink: 0,
        letterSpacing: '2px',
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
        borderRadius: '14px 0 0 14px',
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
        borderRadius: '0 14px 14px 0',
    },
};

const styles = {
    page: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: '16px',
        paddingTop: '32px',
        background: theme.bg,
    },
    card: {
        background: theme.surface,
        borderRadius: '20px',
        padding: '28px 22px',
        maxWidth: '420px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    },
    brandHeader: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
    },
    logoCircle: {
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: theme.primaryLight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.6rem',
    },
    heading: {
        fontSize: '1.4rem',
        fontWeight: '800',
        color: theme.text,
        margin: 0,
    },
    subtitle: {
        fontSize: '0.9rem',
        color: theme.textSecondary,
        margin: 0,
    },
    // Game info
    gameInfoRow: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '8px',
        marginBottom: '8px',
    },
    infoPill: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: theme.surfaceAlt,
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        color: theme.textSecondary,
    },
    // Section
    section: {
        marginTop: '20px',
    },
    sectionTitle: {
        fontSize: '0.95rem',
        fontWeight: '700',
        color: theme.text,
        marginBottom: '4px',
    },
    swipeHint: {
        fontSize: '0.78rem',
        color: theme.textMuted,
        marginBottom: '12px',
    },
    playerList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    // Response banner
    responseBanner: {
        marginTop: '20px',
        padding: '18px 16px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
    },
    // Summary
    summaryRow: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
    },
    summaryPill: {
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    // Guest section
    guestSection: {
        marginTop: '20px',
        borderTop: `1px solid ${theme.border}`,
        paddingTop: '16px',
    },
    guestToggle: {
        background: 'none',
        border: `1.5px dashed ${theme.primary}`,
        color: theme.primary,
        fontSize: '0.88rem',
        cursor: 'pointer',
        fontWeight: '600',
        padding: '10px 20px',
        borderRadius: '12px',
        width: '100%',
    },
    guestForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        alignItems: 'center',
    },
    guestLabel: {
        fontSize: '0.85rem',
        color: theme.textSecondary,
        margin: 0,
    },
    guestInput: {
        width: '100%',
        maxWidth: '260px',
        padding: '10px 14px',
        borderRadius: '12px',
        border: `1.5px solid ${theme.border}`,
        fontSize: '0.95rem',
        textAlign: 'center',
        outline: 'none',
        color: theme.text,
        boxSizing: 'border-box',
    },
    guestJoinBtn: {
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        padding: '10px 24px',
        fontSize: '0.9rem',
        fontWeight: '700',
    },
    guestCancelBtn: {
        background: theme.surfaceAlt,
        color: theme.textSecondary,
        border: `1px solid ${theme.border}`,
        borderRadius: '12px',
        padding: '10px 18px',
        fontSize: '0.9rem',
        fontWeight: '600',
        cursor: 'pointer',
    },
    // Loading
    spinner: {
        width: '36px',
        height: '36px',
        border: `3px solid ${theme.border}`,
        borderTop: `3px solid ${theme.primary}`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 12px',
    },
    loadingText: {
        fontSize: '0.95rem',
        color: theme.textSecondary,
        margin: 0,
    },
    errorIcon: {
        fontSize: '2.5rem',
        marginBottom: '8px',
    },
};

export default GameInvitePage;
