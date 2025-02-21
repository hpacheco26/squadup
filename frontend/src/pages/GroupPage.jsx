import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import { Loader, Button } from 'react-bulma-components';

import GroupSettingsModal from '../components/GroupSettingsModal';
import GameModal from '../components/GameModal'; 
import GamesContainer from '../components/GamesContainer'; // Import the GamesContainer

function GroupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, fetchGroupById, updateGroup, deleteGroup } = useGroupStore();

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isGameCreateModalOpen, setIsGameCreateModalOpen] = useState(false); // State for Game Create Modal

    useEffect(() => {
        // Fetch group data based on the group ID
        fetchGroupById(id);
    }, [id, fetchGroupById]);

    // Show a loader until the group data is available
    if (!group) return <Loader />;

    return (
        <div className="container p-6">
            <div className="box">
                <div className="is-flex is-justify-content-space-between">
                    <h1 className="title is-3">{group.name}</h1>
                    <div>
                        <Button color="warning" onClick={() => setIsSettingsModalOpen(true)}>Settings</Button>
                        {/* Create Game Button */}
                        <Button color="primary" onClick={() => setIsGameCreateModalOpen(true)} style={{ marginLeft: '10px' }}>
                            Create Game
                        </Button>
                    </div>
                </div>
                <p className="subtitle">Sport: {group.sport}</p>

                {/* Group Settings Modal */}
                <GroupSettingsModal 
                    isOpen={isSettingsModalOpen} 
                    setIsOpen={setIsSettingsModalOpen} 
                    group={group} 
                    updateGroup={updateGroup} 
                    deleteGroup={deleteGroup} 
                    navigate={navigate} 
                />
            </div>

            {/* Create Game Modal */}
            <GameModal 
                isOpen={isGameCreateModalOpen} 
                setIsOpen={setIsGameCreateModalOpen} 
                group={group} 
            />

            {/* Display the Games Container */}
            <GamesContainer groupId={group.id} />
        </div>
    );
}

export default GroupPage;
