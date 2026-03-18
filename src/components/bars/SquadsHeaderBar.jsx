import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import CreateGroupModal from '../modals/GroupModal';
import useAuthStore from '../../store/authStore';
import GroupService from '../../api/groupService';
import useLanguageStore from '../../store/languageStore';

const SquadsHeaderBar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [canCreate, setCanCreate] = useState(false);
    const { user } = useAuthStore();
    const { t } = useLanguageStore();

    useEffect(() => {
        if (user?.uid) {
            GroupService.canCreateGroup(user.uid).then(setCanCreate);
        }
    }, [user?.uid]);

    return (
        <>
            <header style={styles.header}>
                {/* App Name */}
                <h1 style={styles.title}>{t('groups')}</h1>
                
                {/* New Group Button */}
                {canCreate && (
                    <button 
                        onClick={() => setIsModalOpen(true)} 
                        style={styles.newGroupButton}
                        aria-label="Create New Group"
                    >
                        <Plus size={24} />
                    </button>
                )}
            </header>

            {/* Create Group Modal */}
            {canCreate && <CreateGroupModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />}
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
        color: '#6b7280',
    }
};

export default SquadsHeaderBar;
