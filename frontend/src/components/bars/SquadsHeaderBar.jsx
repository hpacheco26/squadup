import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CreateGroupModal from '../modals/GroupModal';

const SquadsHeaderBar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <header style={styles.header}>
                {/* App Name */}
                <h1 style={styles.title}>Squads</h1>
                
                {/* New Group Button */}
                <button 
                    onClick={() => setIsModalOpen(true)} 
                    style={styles.newGroupButton}
                    aria-label="Create New Group"
                >
                    <Plus size={24} />
                </button>
            </header>

            {/* Create Group Modal */}
            <CreateGroupModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
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

export default SquadsHeaderBar;
