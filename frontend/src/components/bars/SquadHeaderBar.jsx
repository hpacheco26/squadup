import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import useGroupStore from '../../store/groupStore';

const SquadHeaderBar = () => {
    const { group } = useGroupStore();
    const navigate = useNavigate();

    return (
        <header style={styles.header}>
            {/* App Name */}
            <h1 style={styles.title}>{group?.name || "Squad"}</h1>

            {/* Group Settings Button */}
            <button 
                onClick={() => navigate(`/groups/${group.id}/settings`)} 
                style={styles.settingsButton}
                aria-label="Go to Group Settings"
            >
                <FiSettings size={24} />
            </button>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 15px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    settingsButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
    }
};

export default SquadHeaderBar;
