import React, { useEffect, useState } from 'react';
import { Button } from 'react-bulma-components';
import PlayerCard from '../cards/PlayerCard';
import PlayerModal from '../modals/PlayerModal';
import useGroupStore from '../../store/groupStore';

function PlayersContainer() {
    const { group, updateGroup, fetchGroupById } = useGroupStore();
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

    useEffect(() => {
        if (group?.id) {
            fetchGroupById(group.id);
        }
    }, [group?.id, fetchGroupById]);

    const handleAddPlayer = (newPlayer) => {
        if (!group) return;
        const updatedPlayers = [...(group.players ?? []), newPlayer];
        updateGroup(group.id, { ...group, players: updatedPlayers }).then(() => fetchGroupById(group.id));
    };

    const handleRemovePlayer = (playerId) => {
        if (!group) return;
        const updatedPlayers = (group.players ?? []).filter(player => player.id !== playerId);
        updateGroup(group.id, { ...group, players: updatedPlayers }).then(() => fetchGroupById(group.id));
    };

    if (!group) return <p>Loading...</p>;

    return (
        <div className="box" style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            <h2 className="title is-4 mt-4">Players</h2>
            <Button color="primary" className="mb-4" onClick={() => setIsPlayerModalOpen(true)}>
                Add Player
            </Button>
            
            {/* Single Column Layout */}
            <div className="columns is-multiline">
                {(group.players ?? []).map((player) => (
                    <div className="column is-full" key={player.id}>  
                        <PlayerCard 
                            player={player}
                            onRemovePlayer={handleRemovePlayer}
                        />
                    </div>
                ))}
            </div>

            {/* Add Player Modal */}
            <PlayerModal 
                isOpen={isPlayerModalOpen} 
                setIsOpen={setIsPlayerModalOpen} 
                onAddPlayer={handleAddPlayer} 
            />
        </div>
    );
}

export default PlayersContainer;
