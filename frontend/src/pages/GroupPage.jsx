import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useGameStore from '../store/gameStore';
import { Loader, Button } from 'react-bulma-components';
import GameModal from '../components/modals/GameModal'; 
import GamesContainer from '../components/containers/GamesContainer'; 
import SquadHeaderBar from '../components/bars/SquadHeaderBar';

function GroupPage() {
    const { id } = useParams();
    const { group, fetchGroupById } = useGroupStore();
    const { games, fetchGamesByGroup, loading, error } = useGameStore();

    const [isGameCreateModalOpen, setIsGameCreateModalOpen] = useState(false); 

    useEffect(() => {
        fetchGroupById(id);
        fetchGamesByGroup(id);
    }, [id, fetchGroupById, fetchGamesByGroup]);

    if (!group || loading) return <Loader />;

    return (
        <>
            <SquadHeaderBar />
            <div className="p-4" style={{ maxHeight: "100vh", overflowY: "auto" }}>
                {/* Create Game Modal */}
                <GameModal 
                    isOpen={isGameCreateModalOpen} 
                    setIsOpen={setIsGameCreateModalOpen} 
                    group={group} 
                />

                {/* Display Games Container if there are games */}
                <GamesContainer games={games} />

                {/* Show Schedule Button only if no games exist */}
                {games.length === 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <Button 
                            onClick={() => setIsGameCreateModalOpen(true)} 
                            style={{
                                padding: '12px 24px',  
                                borderRadius: '15px',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                background: '#5b7bb3',
                                color: '#fff',
                                border: 'none',
                            }}
                        >
                            Schedule Game
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

export default GroupPage;
