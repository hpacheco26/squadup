import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import { Loader, Button } from 'react-bulma-components';
import PlayerModal from '../components/PlayerModal';
import GroupSettingsModal from '../components/GroupSettingsModal';
import PlayerCard from '../components/PlayerCard';

function GroupPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, fetchGroupById, updateGroup, deleteGroup } = useGroupStore();

    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    useEffect(() => {
        fetchGroupById(id);
    }, [id, fetchGroupById]);

    const handleAddPlayer = (newPlayer) => {
        if (!group) return;

        const updatedPlayers = [...group.players, newPlayer];
        updateGroup(group.id, { ...group, players: updatedPlayers }).then(() => fetchGroupById(group.id));
    };

    const handleRemovePlayer = (playerId) => {
        if (!group) return;

        const updatedPlayers = group.players.filter(player => player.id !== playerId);
        updateGroup(group.id, { ...group, players: updatedPlayers }).then(() => fetchGroupById(group.id));

    };

    if (!group) return <Loader />;

    return (
        <div className="container p-6">
            <div className="box">
                <div className="is-flex is-justify-content-space-between">
                    <h1 className="title is-3">{group.name}</h1>
                    <Button color="warning" onClick={() => setIsSettingsModalOpen(true)}>Settings</Button>
                </div>
                <p className="subtitle">Sport: {group.sport}</p>
                <h2 className="title is-4 mt-4">Players</h2>
                <div className="columns is-multiline">
                    {group.players.map((player, index) => (
                        <div className="column is-one-third" key={index}>
                            <PlayerCard 
                                player={player} // Passing the entire player object
                                onRemovePlayer={handleRemovePlayer} // Passing handleRemovePlayer to PlayerCard
                            />
                        </div>
                    ))}
                </div>
                <Button color="primary" onClick={() => setIsPlayerModalOpen(true)}>Add Player</Button>
            </div>

            {/* Add Player Modal */}
            <PlayerModal 
                isOpen={isPlayerModalOpen} 
                setIsOpen={setIsPlayerModalOpen} 
                onAddPlayer={handleAddPlayer} 
            />

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
    );
}


export default GroupPage;
