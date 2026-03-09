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
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
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
