import React, { useState } from 'react';
import useGroupStore from '../../store/groupStore';
import GroupSettingsModal from '../modals/GroupSettingsModal';
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';

const SquadHeaderBar = () => {
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const { group, updateGroup, deleteGroup } = useGroupStore();
    const navigate = useNavigate();

    return (
        <>
            <header style={styles.header}>
                {/* App Name */}
                <h1 style={styles.title}>{group.name}</h1>

                {/* Group Settings Button */}
                <button 
                    onClick={() => setIsSettingsModalOpen(true)} 
                    style={styles.settingsButton}
                    aria-label="Go to Squad Settings"
                >
                    <FiSettings size={24} />
                </button>
            </header>

            {/* Group Settings Modal */}
            <GroupSettingsModal 
                    isOpen={isSettingsModalOpen} 
                    setIsOpen={setIsSettingsModalOpen} 
                    group={group} 
                    updateGroup={updateGroup} 
                    deleteGroup={deleteGroup} 
                    navigate={navigate} 
                />

        </>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#f8f9fa', // Light background
        borderBottom: '1px solid #ddd',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    newGroupButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
    }
};

export default SquadHeaderBar;
