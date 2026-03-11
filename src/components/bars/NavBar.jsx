import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClipboard, FiUsers, FiUser } from 'react-icons/fi';
import { TbTriangleSquareCircleFilled } from 'react-icons/tb';
import { MdGroups3, MdSportsSoccer } from 'react-icons/md';
import useGameStore from '../../store/gameStore';
import useGroupStore from '../../store/groupStore';

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
            color: disabled ? '#475569' : active ? '#ffffff' : '#94a3b8',
            opacity: disabled ? 0.4 : 1,
        }}
    >
        <span style={{ fontSize: '20px', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: '0.6rem', fontWeight: active ? '600' : '400' }}>{label}</span>
    </button>
);

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { game, games } = useGameStore();
    const { group } = useGroupStore();

    const pathname = location.pathname;

    // Hide on certain routes
    if (['/login', '/signup', '/rank', '/settings'].includes(pathname) || pathname.startsWith('/game-invite') || pathname.startsWith('/join')) {
        return null;
    }

    // Parse route context
    const groupMatch = pathname.match(/^\/groups\/([^/]+)/);
    const pregameMatch = pathname.match(/^\/pregame\/([^/]+)/);
    const teamsMatch = pathname.match(/^\/teams\/([^/]+)/);
    const gamePageMatch = pathname.match(/^\/game\/([^/]+)/);

    const isGroupContext = groupMatch || pregameMatch || teamsMatch || gamePageMatch;

    const gameId = pregameMatch?.[1] || teamsMatch?.[1] || gamePageMatch?.[1] || game?.id || (games?.length > 0 ? games[0].id : null);
    const groupId = groupMatch?.[1] || game?.groupId || group?.id || null;

    // Active states
    const isGroupHub = !!groupMatch;
    const isPregame = !!pregameMatch;
    const isTeams = !!teamsMatch;
    const isGame = !!gamePageMatch;
    const isHome = pathname === '/';
    const isSettings = pathname === '/settings';

    if (!isGroupContext) {
        return (
            <nav style={{ ...styles.navbar, justifyContent: 'center' }}>
                <NavItem icon={<FiUser size={22} />} label="Profile" onClick={() => navigate('/settings')} />
            </nav>
        );
    }

    // Full navbar in group/game context
    return (
        <nav style={styles.navbar}>
            <NavItem icon={<TbTriangleSquareCircleFilled size={22} />} label="Home" onClick={() => navigate('/')} />
            <NavItem icon={<MdGroups3 size={22} />} label="Hub" active={isGroupHub} onClick={() => groupId && navigate(`/groups/${groupId}`)} />
            <NavItem icon={<FiClipboard size={20} />} label="PreGame" active={isPregame} onClick={() => gameId && navigate(`/pregame/${gameId}`)} />
            <NavItem icon={<FiUsers size={20} />} label="Teams" active={isTeams} onClick={() => gameId && navigate(`/teams/${gameId}`)} />
            <NavItem icon={<MdSportsSoccer size={20} />} label="Game" active={isGame} onClick={() => gameId && navigate(`/game/${gameId}`)} />
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
