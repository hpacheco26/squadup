import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import GroupSwitcher from '../GroupSwitcher';
import logo from '../../assets/logo.png';

/**
 * Unified app header.
 *
 * Layout: [left slot] [center slot] [right slot]
 *
 * Props:
 *  - variant: 'switcher' (default) shows the GroupSwitcher in the center.
 *             'logo'     shows the logo in the center (Home / Profile).
 *  - title: if provided, the center renders this string as a plain title
 *           (no switcher, no logo). Useful for focused subpages.
 *  - onBack: if provided, replaces left slot with a back arrow.
 *  - rightIcon: a component (e.g. FiSettings, CalendarCog) for the right action button.
 *  - onRightClick: handler for the right action button.
 *  - right: arbitrary node to render in the right slot (overrides rightIcon).
 */
const AppHeaderBar = ({ variant = 'switcher', title, onBack, rightIcon: RightIcon, onRightClick, right }) => {
    const navigate = useNavigate();

    const Left = onBack ? (
        <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', color: 'var(--c-text-secondary)' }}
            aria-label="Back"
        >
            <IoIosArrowBack size={24} />
        </button>
    ) : variant === 'logo' ? (
        <span style={{ width: 36 }} />
    ) : null;

    const Center = title !== undefined ? (
        <span style={{
            fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-text)',
            letterSpacing: '0.2px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{title}</span>
    ) : variant === 'logo' ? (
        <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Home"
        >
            <img src={logo} alt="SquadUp" className="logo-themed" style={{ height: 32 }} />
        </button>
    ) : (
        <GroupSwitcher />
    );

    const Right = right !== undefined ? right : (RightIcon ? (
        <button
            onClick={onRightClick}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--c-text-muted)', display: 'flex', alignItems: 'center' }}
            aria-label="Header action"
        >
            <RightIcon size={22} />
        </button>
    ) : (
        <span style={{ width: 36 }} />
    ));

    const centerAlign = title !== undefined ? 'center' : 'flex-start';

    return (
        <header style={{
            display: 'flex', alignItems: 'center',
            justifyContent: variant === 'logo' ? 'space-between' : 'flex-start',
            gap: 8,
            padding: '8px 12px',
            background: 'var(--c-surface)',
            borderBottom: '1px solid var(--c-border)',
        }}>
            {Left}
            {variant === 'logo' && title === undefined ? Center : (
                <div style={{ flex: 1, display: 'flex', justifyContent: centerAlign, minWidth: 0 }}>{Center}</div>
            )}
            {Right}
        </header>
    );
};

export default AppHeaderBar;
