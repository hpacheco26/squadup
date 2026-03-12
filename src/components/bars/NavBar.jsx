import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard, FiUsers, FiUser } from 'react-icons/fi';
import { TbTriangleSquareCircleFilled } from 'react-icons/tb';
import { MdGroups3, MdSportsSoccer } from 'react-icons/md';
import { Wallet } from 'lucide-react';
import useGameStore from '../../store/gameStore';
import useGroupStore from '../../store/groupStore';
import useLanguageStore from '../../store/languageStore';

const NavItem = ({ icon, label, active, disabled, onClick }) => (
    <button
        onClick={disabled ? undefined : onClick}
        style={{
            background: 'none',
            border: 'none',
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            padding: '4px 8px',
            color: disabled ? '#64748b' : active ? '#ffffff' : '#94a3b8',
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
        }}
    >
        <span style={{ fontSize: '20px', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: active ? '600' : '400' }}>{label}</span>
    </button>
);

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { game, games, upcomingGames, subscribeToGamesByGroup } = useGameStore();
    const { group } = useGroupStore();
    const { t } = useLanguageStore();
    const lastGameIdRef = useRef(null);
    const lastGroupIdRef = useRef(null);

    const pathname = location.pathname;

    // Parse route context early so we can use it in the effect
    const groupMatch = pathname.match(/^\/groups\/([^/]+)/);
    const pregameMatch = pathname.match(/^\/pregame\/([^/]+)/);
    const teamsMatch = pathname.match(/^\/teams\/([^/]+)/);
    const paymentsMatch = pathname.match(/^\/payments\/([^/]+)/);
    const gamePageMatch = pathname.match(/^\/game\/([^/]+)/);

    const currentGroupId = groupMatch?.[1] || paymentsMatch?.[1] || game?.groupId || group?.id || null;

    // Ensure games are loaded for the current group context
    useEffect(() => {
        if (!currentGroupId) return;
        const unsub = subscribeToGamesByGroup(currentGroupId);
        return unsub;
    }, [currentGroupId, subscribeToGamesByGroup]);

    // Hide on certain routes
    if (['/login', '/signup', '/rank', '/settings'].includes(pathname) || pathname.startsWith('/game-invite') || pathname.startsWith('/join')) {
        return null;
    }

    const isGroupContext = groupMatch || pregameMatch || teamsMatch || paymentsMatch || gamePageMatch;

    // Clear cached game when group changes
    if (currentGroupId && currentGroupId !== lastGroupIdRef.current) {
        lastGroupIdRef.current = currentGroupId;
        lastGameIdRef.current = null;
    }

    const isActive = (g) => g.status === 'open' || g.status === 'confirmed';
    const openGame = games?.find(g => isActive(g) && (!currentGroupId || g.groupId === currentGroupId))
        || upcomingGames?.find(g => isActive(g) && g.groupId === currentGroupId);
    const openGameId = openGame?.id || null;
    // Only use single game if it belongs to current group and is active
    const singleGameId = game && isActive(game) && (!currentGroupId || game.groupId === currentGroupId) ? game.id : null;
    const resolvedGameId = pregameMatch?.[1] || teamsMatch?.[1] || gamePageMatch?.[1] || singleGameId || openGameId;

    // Remember the last known open game ID so it persists across page navigations
    if (resolvedGameId) lastGameIdRef.current = resolvedGameId;
    const gameId = resolvedGameId || lastGameIdRef.current;
    const groupId = currentGroupId;

    // Active states
    const isGroupHub = !!groupMatch;
    const isPregame = !!pregameMatch;
    const isTeams = !!teamsMatch;
    const isPayments = !!paymentsMatch;
    const isGame = !!gamePageMatch;
    const isHome = pathname === '/';
    const isSettings = pathname === '/settings';

    if (!isGroupContext) {
        return (
            <nav style={{ ...styles.navbar, justifyContent: 'center' }}>
                <NavItem icon={<FiUser size={22} />} label={t('navProfile')} onClick={() => navigate('/settings')} />
            </nav>
        );
    }

    const hasGame = !!openGameId || !!singleGameId;

    // Full navbar in group/game context
    return (
        <nav style={styles.navbar}>
            <NavItem icon={<TbTriangleSquareCircleFilled size={22} />} label={t('navHome')} onClick={() => navigate('/')} />
            <NavItem icon={<MdGroups3 size={22} />} label={t('navHub')} active={isGroupHub} onClick={() => groupId && navigate(`/groups/${groupId}`)} />
            <NavItem icon={<FiClipboard size={20} />} label={t('navPreGame')} active={isPregame} disabled={!hasGame} onClick={() => gameId && navigate(`/pregame/${gameId}`)} />
            <NavItem icon={<FiUsers size={20} />} label={t('navTeams')} active={isTeams} disabled={!hasGame} onClick={() => gameId && navigate(`/teams/${gameId}`)} />
            <NavItem icon={<MdSportsSoccer size={20} />} label={t('navGame')} active={isGame} disabled={!hasGame} onClick={() => gameId && navigate(`/game/${gameId}`)} />
            <NavItem icon={<Wallet size={18} />} label={t('navPay')} active={isPayments} onClick={() => groupId && navigate(`/payments/${groupId}`)} />
        </nav>
    );
};

const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '6px 0',
        backgroundColor: '#1e293b',
        borderTop: '1px solid #334155',
        flexShrink: 0,
    },
};

export default NavBar;
