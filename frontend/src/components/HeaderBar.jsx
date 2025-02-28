import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';

const HeaderBar = () => {
    const navigate = useNavigate();
    
    return (
        <header style={styles.header}>
            {/* App Name */}
            <h1 style={styles.title}>SquadUp</h1>
            
            {/* Settings Button (Removed from HomePage) */}
            <button 
                onClick={() => navigate('/settings')} 
                style={styles.settingsButton}
                aria-label="Go to Account Settings"
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
        padding: '15px 20px',
        backgroundColor: '#f8f9fa', // Light background
        borderBottom: '1px solid #ddd',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        width: '100%',
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
    }
};

export default HeaderBar;
