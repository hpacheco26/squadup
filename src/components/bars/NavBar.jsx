import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard, FiUsers } from 'react-icons/fi';
import { TbTriangleSquareCircleFilled } from 'react-icons/tb';
import { MdGroups3, MdSportsSoccer } from 'react-icons/md';
import { Wallet } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useGroupStore from '../../store/groupStore';
import useAuthStore from '../../store/authStore';
import useLanguageStore from '../../store/languageStore';

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1px',
            padding: '2px 4px',
            color: active ? '#ffffff' : '#94a3b8',
            flex: 1,
            minWidth: 0,
            position: 'relative',
            transition: 'color 0.15s',
        }}
    >
        <span
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 24,
                borderRadius: 12,
                background: active ? 'rgba(91, 123, 179, 0.28)' : 'transparent',
                position: 'relative',
                transition: 'background 0.15s',
            }}
        >
            {icon}
        </span>
        <span style={{ fontSize: '0.6rem', fontWeight: 500 }}>{label}</span>
    </button>
);

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { game, games, upcomingGames, subscribeToGamesByGroup } = useGameStore();
    const { group } = useGroupStore();
    const { selectedGroupId, setSelectedGroupId } = useAuthStore();
    const { t } = useLanguageStore();
    // Sticky last gameId per group so a stale gameId from one group never
    // leaks into another after switching.
    const lastGameByGroupRef = useRef({});

    const pathname = location.pathname;

    // Parse route context
    const groupMatch = pathname.match(/^\/groups\/([^/]+)/);
    const pregameMatch = pathname.match(/^\/pregame\/([^/]+)/);
    const teamsMatch = pathname.match(/^\/teams\/([^/]+)/);
    const paymentsMatch = pathname.match(/^\/payments\/([^/]+)/);
    const gamePageMatch = pathname.match(/^\/game\/([^/]+)/);
    // Bare empty-state routes (no gameId) — still light up the corresponding tab
    const isPregameEmpty = pathname === '/pregame';
    const isTeamsEmpty = pathname === '/teams';
    const isGameEmpty = pathname === '/game';
    const gameSettingsMatch = pathname.match(/^\/games\/([^/]+)\/settings/);
    const groupSettingsMatch = pathname.match(/^\/groups\/([^/]+)\/settings/);
    const newGameMatch = pathname.match(/^\/groups\/([^/]+)\/games\/new/);

    const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };

    // Sync selectedGroupId from URL when user navigates into a group/payments page
    const urlGroupId = (groupMatch?.[1] && decode(groupMatch[1]))
        || (paymentsMatch?.[1] && decode(paymentsMatch[1]))
        || null;

    useEffect(() => {
        if (urlGroupId && urlGroupId !== selectedGroupId) {
            setSelectedGroupId(urlGroupId);
        }
    }, [urlGroupId, selectedGroupId, setSelectedGroupId]);

    // Also sync from active game's groupId, but ONLY on game-context routes
    // (pregame/teams/game). On group/payments routes the URL is authoritative,
    // and a stale `game` from a previous group would otherwise fight the URL
    // sync and cause an infinite update loop.
    const onGameRoute = !!(pregameMatch || teamsMatch || gamePageMatch);
    useEffect(() => {
        if (!onGameRoute) return;
        const gid = game?.groupId;
        if (gid && gid !== selectedGroupId) setSelectedGroupId(gid);
    }, [onGameRoute, game?.groupId, selectedGroupId, setSelectedGroupId]);

    const groupId = selectedGroupId || urlGroupId || group?.id || game?.groupId || null;

    // Ensure games are loaded for the active group context
    useEffect(() => {
        if (groupId) subscribeToGamesByGroup(groupId);
    }, [groupId, subscribeToGamesByGroup]);

    // Hide on certain routes
    if (
        ['/login', '/signup', '/rank', '/settings'].includes(pathname)
        || pathname.startsWith('/game-invite')
        || pathname.startsWith('/join')
        || gameSettingsMatch
        || groupSettingsMatch
        || newGameMatch
    ) {
        return null;
    }

    // Resolve a usable gameId for game-context tabs
    const isActive = (g) => g.status === 'open' || g.status === 'confirmed';
    const openGame = games?.find(g => isActive(g) && (!groupId || g.groupId === groupId))
        || upcomingGames?.find(g => isActive(g) && g.groupId === groupId);
    const openGameId = openGame?.id || null;
    const singleGameId = game && isActive(game) && (!groupId || game.groupId === groupId) ? game.id : null;
    const resolvedGameId = pregameMatch?.[1] || teamsMatch?.[1] || gamePageMatch?.[1] || singleGameId || openGameId;

    if (resolvedGameId && groupId) lastGameByGroupRef.current[groupId] = resolvedGameId;

    // Validate any sticky id is still a real, active game in this group.
    // Without this, a canceled/deleted game stays pinned and the PreGame/Teams/Game
    // tabs route to a dead id, which then redirects back to the hub.
    const stickyId = groupId ? lastGameByGroupRef.current[groupId] : null;
    const stickyStillActive = stickyId
        && (games || []).some(g => g.id === stickyId && isActive(g) && g.groupId === groupId);
    if (stickyId && !resolvedGameId && !stickyStillActive && groupId) {
        delete lastGameByGroupRef.current[groupId];
    }
    const gameId = resolvedGameId || (stickyStillActive ? stickyId : null);

    // Active states
    const isHome = pathname === '/';
    const isGroupHub = !!groupMatch && !groupSettingsMatch && !newGameMatch;
    const isPregame = !!pregameMatch || isPregameEmpty;
    const isTeams = !!teamsMatch || isTeamsEmpty;
    const isPayments = !!paymentsMatch;
    const isGame = !!gamePageMatch || isGameEmpty;

    const hasGroup = !!groupId;

    // Smart fallback: tabs are always tappable.
    // - Hub/Pay without a group go Home.
    // - PreGame/Teams/Game without an active game go to /pregame, which
    //   renders the empty state with a “Schedule game” CTA.
    const goHub = () => navigate(groupId ? `/groups/${groupId}` : '/');
    const goGameTab = (route) => {
        if (gameId) navigate(`/${route}/${gameId}`);
        else navigate(`/${route}`);
    };

    return (
        <nav style={styles.navbar}>
            <NavItem icon={<TbTriangleSquareCircleFilled size={20} />} label={t('navHome')} active={isHome} onClick={() => navigate('/')} />
            <NavItem icon={<MdGroups3 size={20} />} label={t('navHub')} active={isGroupHub} onClick={goHub} />
            <div style={styles.cluster}>
                <NavItem icon={<FiClipboard size={18} />} label={t('navPreGame')} active={isPregame} onClick={() => goGameTab('pregame')} />
                <NavItem icon={<FiUsers size={18} />} label={t('navTeams')} active={isTeams} onClick={() => goGameTab('teams')} />
                <NavItem icon={<MdSportsSoccer size={18} />} label={t('navGame')} active={isGame} onClick={() => goGameTab('game')} />
            </div>
            <NavItem icon={<Wallet size={16} />} label={t('navPay')} active={isPayments} onClick={() => navigate(groupId ? `/payments/${groupId}` : '/')} />
        </nav>
    );
};

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'stretch',
        padding: '3px 6px',
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
        flexShrink: 0,
        gap: 4,
    },
    cluster: {
        display: 'flex',
        flex: 3,
        minWidth: 0,
        alignItems: 'center',
        borderRadius: 14,
        background: 'rgba(148,163,184,0.10)',
        border: '1px solid rgba(148,163,184,0.18)',
        padding: '0 2px',
    },
};

export default NavBar;
