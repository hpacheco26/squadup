import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";

const SquadSettingsHeaderBar = ({ group, groupName, setGroupName, updateGroup, navigate }) => {
    const handleUpdateGroup = () => {
        if (groupName.trim()) {
            updateGroup(group.id, { ...group, name: groupName });
            navigate(`/groups/${group.id}`);
        }
    };
    
    return (
        <header style={styles.header}>
            {/* Back Button */}
            <button onClick={() => navigate(`/groups/${group.id}`)} style={styles.backButton}>
                <IoIosArrowBack size={24} />
            </button>
            
            {/* App Name */}
            <h1 style={styles.title}>Group Settings</h1>

            {/* Save Button */}
            <button onClick={handleUpdateGroup} style={styles.saveButton} aria-label="Save">
                <FiSave size={24} />
            </button>
        </header>
    );
};

const styles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
    },
    backButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
    },
    saveButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '5px',
        display: 'flex',
        alignItems: 'center',
    },
};

export default SquadSettingsHeaderBar;
