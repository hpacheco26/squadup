import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import GameService from '../api/gameService';
import GroupService from '../api/groupService';
import useAuthStore from '../store/authStore';
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
    const { user, loginWithGoogle } = useAuthStore();
    const [game, setGame] = useState(null);
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [respondedPlayerId, setRespondedPlayerId] = useState(null);
    const [respondedStatus, setRespondedStatus] = useState(null);

    useEffect(() => {
        if (!user) return;

        async function load() {
            setLoading(true);
            try {
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
    }, [gameId, user]);

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

    // --- Not authenticated — show auth gate ---
    if (!user) {
        return (
            <Shell>
                <AuthGate t={t} loginWithGoogle={loginWithGoogle} gameId={gameId} />
            </Shell>
        );
    }

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
                                playerStatus="?"
                                onLeft={() => handleResponse(player, 'out')}
                                onRight={() => handleResponse(player, 'in')}
                            />
                        ))}
                    </div>
                </div>
            )}
        </Shell>
    );
}

/* ── Auth gate — shown when the visitor is not signed in ── */

function AuthGate({ t, loginWithGoogle, gameId }) {
    const navigate = useNavigate();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleError, setGoogleError] = useState('');

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        setGoogleError('');
        await loginWithGoogle();
        // loginWithGoogle catches its own errors; if user is still null it failed
        const { user: currentUser } = useAuthStore.getState();
        if (!currentUser) {
            setGoogleError(t('googleSignInFailed'));
        }
        setGoogleLoading(false);
    };

    const goTo = (path) => {
        sessionStorage.setItem('returnTo', `/game-invite/${gameId}`);
        navigate(path);
    };

    return (
        <div className={styles.authGate}>
            <p className={styles.heading}>{t('signInToRespond')}</p>
            <p className={styles.subtitle}>{t('signInToRespondSubtitle')}</p>

            <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className={styles.googleBtn}
            >
                <FaGoogle size={16} />
                <span>{googleLoading ? '…' : t('loginWithGoogle')}</span>
            </button>

            {googleError && <p className={styles.authError}>{googleError}</p>}

            <div className={styles.authDividerRow}>
                <span className={styles.authDividerLine} />
                <span className={styles.authDividerText}>{t('orDivider')}</span>
                <span className={styles.authDividerLine} />
            </div>

            <div className={styles.authLinksRow}>
                <button onClick={() => goTo('/signup')} className={styles.authLinkBtn}>
                    {t('createAccount')}
                </button>
                <button onClick={() => goTo('/login')} className={styles.authLinkBtn}>
                    {t('login')}
                </button>
            </div>

            <p className={styles.privacyNote}>
                {t('byJoiningYouAgree')}{' '}
                <a href="/privacy">{t('privacyPolicy')}</a>
                {' & '}
                <a href="/terms">{t('termsOfService')}</a>.
            </p>
        </div>
    );
}

/* ── Layout shell — gradient background + AppHeaderBar-style logo strip ── */

function Shell({ children }) {
    return (
        <div className={styles.page}>
            <header className={styles.appHeader}>
                <img src={logo} alt="SquadUp" className={`${styles.appHeaderLogo} logo-themed`} />
            </header>
            <div className={styles.pageBody}>
                {children}
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
