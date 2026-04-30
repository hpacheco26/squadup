import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { signInAnonymously } from 'firebase/auth';
import { Check, X, CheckCircle2, XCircle, UserPlus, ChevronRight } from 'lucide-react';
import { auth } from '../config/firebase';
import GameService from '../api/gameService';
import GroupService from '../api/groupService';
import useLanguageStore from '../store/languageStore';
import SwipePlayer from '../components/SwipePlayer';
import GameCard from '../components/cards/GameCard';
import theme from '../theme';
import logo from '../assets/logo.png';
import fieldImage from '../assets/field.png';
import styles from './GameInvitePage.module.css';

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
        let createdAnonymously = false;

        async function load() {
            try {
                if (!auth.currentUser) {
                    await signInAnonymously(auth);
                    createdAnonymously = true;
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

        return () => {
            // Anonymous accounts are only needed for Firestore read access.
            if (createdAnonymously && auth.currentUser?.isAnonymous) {
                auth.currentUser.delete().catch(() => { });
            }
        };
    }, [gameId]);

    const handleResponse = async (player, status) => {
        if (!game) return;

        let updatedIn = [...(game.playersIn || [])];
        let updatedOut = [...(game.playersOut || [])];
        let updatedInvited = [...(game.playersInvited || [])];

        updatedIn = updatedIn.filter(p => p.id !== player.id);
        updatedOut = updatedOut.filter(p => p.id !== player.id);
        updatedInvited = updatedInvited.filter(p => p.id !== player.id);

        if (status === 'in') updatedIn.push(player);
        else updatedOut.push(player);

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
            <Shell>
                <div className={styles.spinner} />
                <p className={styles.loadingText}>{t('loadingGame')}</p>
            </Shell>
        );
    }

    // --- Error state ---
    if (error) {
        return (
            <Shell>
                <div className={styles.errorIcon}>⚠️</div>
                <p className={styles.heading} style={{ color: theme.danger }}>{t('oops')}</p>
                <p className={styles.subtitle}>{error}</p>
            </Shell>
        );
    }

    // --- Already responded ---
    if (respondedPlayerId) {
        const isIn = respondedStatus === 'in';
        const accent = isIn ? theme.success : theme.danger;
        const accentLight = isIn ? theme.successLight : theme.dangerLight;
        const Icon = isIn ? CheckCircle2 : XCircle;
        return (
            <Shell>
                <InvitedEyebrow t={t} />
                <GameCardWrap game={game} group={group} t={t} />
                <div
                    className={styles.responseBanner}
                    style={{
                        background: `linear-gradient(180deg, ${accentLight} 0%, #ffffff 100%)`,
                        border: `1px solid ${accent}33`,
                    }}
                >
                    <div className={styles.responseIconCircle}>
                        <Icon size={36} color={accent} strokeWidth={2.2} />
                    </div>
                    <p className={styles.responseHeading} style={{ color: accent }}>
                        {isIn ? t('youreInGame') : t('youreOut')}
                    </p>
                </div>
            </Shell>
        );
    }

    // --- Main invite view ---
    const invitedPlayers = game.playersInvited || [];

    return (
        <Shell>
            <InvitedEyebrow t={t} />
            <GameCardWrap game={game} group={group} t={t} />

            {invitedPlayers.length > 0 && (
                <div className={styles.section}>
                    <p className={styles.sectionTitle}>{t('findYourName')}</p>
                    <p className={styles.swipeHint}>{t('swipeHint')}</p>
                    <div className={styles.playerList}>
                        {invitedPlayers.map(player => (
                            <SwipePlayer
                                key={player.id}
                                player={player}
                                onLeft={() => handleResponse(player, 'out')}
                                onRight={() => handleResponse(player, 'in')}
                                leftAction={{
                                    color: theme.success,
                                    icon: <Check size={20} color="#fff" strokeWidth={3} />,
                                }}
                                rightAction={{
                                    color: theme.danger,
                                    icon: <X size={20} color="#fff" strokeWidth={3} />,
                                }}
                            >
                                <div className={styles.inviteRow}>
                                    <div className={styles.avatar}>
                                        {player.firstName?.[0]?.toUpperCase() || '?'}
                                    </div>
                                    <span className={styles.playerName}>
                                        {player.firstName} {player.lastName}
                                    </span>
                                    <span className={styles.swipeArrows}>⟵ ⟶</span>
                                </div>
                            </SwipePlayer>
                        ))}
                    </div>
                </div>
            )}

            {/* Guest join section */}
            <div className={styles.guestSection}>
                {!showGuestInput ? (
                    <button
                        type="button"
                        onClick={() => setShowGuestInput(true)}
                        className={styles.guestCard}
                    >
                        <span className={styles.guestCardIcon}>
                            <UserPlus size={22} strokeWidth={2.2} />
                        </span>
                        <span className={styles.guestCardBody}>
                            <span className={styles.guestCardTitle}>{t('guestCardTitle')}</span>
                            <span className={styles.guestCardSubtitle}>{t('guestCardSubtitle')}</span>
                        </span>
                        <ChevronRight size={20} className={styles.guestCardChevron} />
                    </button>
                ) : (
                    <div className={styles.guestForm}>
                        <p className={styles.guestLabel}>{t('enterYourName')}</p>
                        <input
                            type="text"
                            value={guestName}
                            onChange={e => setGuestName(e.target.value)}
                            placeholder={t('namePlaceholder')}
                            maxLength={40}
                            className={styles.guestInput}
                            autoFocus
                        />
                        <div className={styles.guestActions}>
                            <button
                                onClick={() => { setShowGuestInput(false); setGuestName(''); }}
                                className={styles.guestCancelBtn}
                            >
                                {t('cancelGuest')}
                            </button>
                            <button
                                onClick={handleGuestJoin}
                                disabled={!guestName.trim() || guestSubmitting}
                                className={styles.guestJoinBtn}
                                style={{
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
        </Shell>
    );
}

/* ── Layout shell — gradient background + AppHeaderBar-style logo strip ── */

function Shell({ children }) {
    return (
        <div className={styles.page}>
            <header className={styles.appHeader}>
                <img src={logo} alt="SquadUp" className={styles.appHeaderLogo} />
            </header>
            <div className={styles.content}>
                <div className={styles.card}>{children}</div>
            </div>
        </div>
    );
}

/* ── Sub-components ── */

function InvitedEyebrow({ t }) {
    return (
        <p className={styles.invitedEyebrow}>{t('youreInvited')}</p>
    );
}

function GameCardWrap({ game, group, t }) {
    // GameCard reads `game.groupName`; the invite page loads the group separately,
    // so merge the name in here.
    const merged = group?.name ? { ...game, groupName: group.name } : game;
    return (
        <div className={styles.gameCardWrap}>
            <GameCard game={merged} t={t} backgroundImage={fieldImage} />
        </div>
    );
}

export default GameInvitePage;
