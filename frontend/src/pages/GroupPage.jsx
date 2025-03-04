import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import { Loader, Button } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import {  faFutbol } from '@fortawesome/free-solid-svg-icons'; // Import icons - changed to a soccer ball for sports

import GameModal from '../components/modals/GameModal'; 
import GamesContainer from '../components/containers/GamesContainer'; // Import the GamesContainer

import SquadHeaderBar from '../components/bars/SquadHeaderBar';

function GroupPage() {
    const { id } = useParams();
    const { group, fetchGroupById } = useGroupStore();

    const [isGameCreateModalOpen, setIsGameCreateModalOpen] = useState(false); // State for Game Create Modal

    useEffect(() => {
        // Fetch group data based on the group ID
        fetchGroupById(id);
    }, [id, fetchGroupById]);

    // Show a loader until the group data is available
    if (!group) return <Loader />;

    return (
        <>
            <SquadHeaderBar />
            <div className="container p-4">
                {/* Create Game Modal */}
                <GameModal 
                    isOpen={isGameCreateModalOpen} 
                    setIsOpen={setIsGameCreateModalOpen} 
                    group={group} 
                />

                {/* Display the Games Container */}
                <GamesContainer groupId={group.id} />

                {/* Create Game Icon Button */}
                <div className='m-2' style={{  }}>
                    <Button 
                        color="primary" 
                        onClick={() => setIsGameCreateModalOpen(true)} 
                        style={{
                            padding: '10px',  
                            borderRadius: '50%',
                            fontSize: '40px' 
                        }}
                    >
                        <FontAwesomeIcon icon={faFutbol} size="1x" />
                    </Button>
                </div>
            </div>
        </>
    );
}

export default GroupPage;
