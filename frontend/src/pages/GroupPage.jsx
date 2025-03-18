import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import { Loader, Button } from 'react-bulma-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faFutbol } from '@fortawesome/free-solid-svg-icons'; 

import GameModal from '../components/modals/GameModal'; 
import GamesContainer from '../components/containers/GamesContainer'; 
import SquadHeaderBar from '../components/bars/SquadHeaderBar';

function GroupPage() {
    const { id } = useParams();
    const { group, fetchGroupById } = useGroupStore();

    const [isGameCreateModalOpen, setIsGameCreateModalOpen] = useState(false); 

    useEffect(() => {
        fetchGroupById(id);
    }, [id, fetchGroupById]);

    if (!group) return <Loader />;

    return (
        <>
            <SquadHeaderBar />
            <div className="container p-4" style={{ maxHeight: "100vh", overflowY: "auto" }}>
                {/* Create Game Modal */}
                <GameModal 
                    isOpen={isGameCreateModalOpen} 
                    setIsOpen={setIsGameCreateModalOpen} 
                    group={group} 
                />

                {/* Display the Games Container */}
                <GamesContainer groupId={group.id} />

                {/* Centered Button with Shadow */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Button 
                        color="primary" 
                        onClick={() => setIsGameCreateModalOpen(true)} 
                        style={{
                            padding: '12px 24px',  
                            borderRadius: '15px',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Adds shadow
                            fontSize: '16px',
                            fontWeight: 'bold',
                        }}
                    >
                        Schedule Game
                    </Button>
                </div>
            </div>
        </>
    );
}

export default GroupPage;
