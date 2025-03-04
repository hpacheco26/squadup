import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import { Loader, Button } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faCog, faFutbol } from '@fortawesome/free-solid-svg-icons'; // Import icons - changed to a soccer ball for sports

import GroupSettingsModal from '../components/modals/GroupSettingsModal';
import GameModal from '../components/modals/GameModal'; 
import GamesContainer from '../components/containers/GamesContainer'; // Import the GamesContainer

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
        <div className="container">
            <div className="box">
                <div className="is-flex is-justify-content-space-between">
                    <h1 className="title is-3">{group.name}</h1>
                    <div>
                        {/* Settings Icon Button */}
                        <Button 
                            color="warning" 
                            onClick={() => setIsSettingsModalOpen(true)} 
                            style={{ padding: '10px', borderRadius: '50%' }}
                        >
                            <FontAwesomeIcon icon={faCog} size="lg" />
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

            {/* Create Game Icon Button - Positioned in the bottom right corner */}
            <div style={{ position: 'fixed', bottom: '20px', right: '20px' }}>
                <Button 
                    color="primary" 
                    onClick={() => setIsGameCreateModalOpen(true)} 
                    style={{
                        padding: '10px',  // Increased padding for larger button
                        borderRadius: '50%',
                        fontSize: '40px'  // Adjust the font size for the icon to make it larger
                    }}
                >
                    <FontAwesomeIcon icon={faFutbol} size="1x" /> {/* Changed to the soccer ball icon */}
                </Button>
            </div>
        </div>
    );
}

export default GroupPage;
