import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';  // Assuming you've updated the store
import { Loader, Button } from 'react-bulma-components'; // Optional: You can use a loader component from Bulma if needed
import PlayerModal from '../components/PlayerModal'; // Import the AddPlayerModal

function GroupPage() {
    const { id } = useParams();
    const { group, fetchGroupById, updateGroup } = useGroupStore();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch the group by ID when the component mounts
    useEffect(() => {
        fetchGroupById(id);
    }, [id, fetchGroupById]);

    // Function to handle adding a player to the group
    const handleAddPlayer = (newPlayer) => {
        const updatedGroup = {
            ...group,
            players: [...group.players, newPlayer]  // Add the new player to the players array
        };

        updateGroup(id, updatedGroup);  // Update the group using the store's `updateGroup` method
    };

    if (!group) return <Loader />;  // Show loading spinner while group data is being fetched

    return (
        <div className="container p-6">
            <div className="box">
                <h1 className="title is-3">{group.name}</h1>
                <p className="subtitle">Sport: {group.sport}</p>
                <h2 className="title is-4 mt-4">Players</h2>
                <div className="columns is-multiline">
                    {group.players.map((player, index) => (
                        <div className="column is-one-third" key={index}>
                            <div className="card">
                                <div className="card-content">
                                    <p className="title is-5">{player.firstName} {player.lastName}</p>
                                    <p className="subtitle is-6">Rank: {player.rank}</p>
                                    <p>Wins: {player.stats.wins}</p>
                                    <p>Draws: {player.stats.draws}</p>
                                    <p>Losses: {player.stats.losses}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Button to open the Add Player modal */}
                <Button color="primary" onClick={() => setIsModalOpen(true)}>
                    Add Player
                </Button>

                {/* Add Player Modal */}
                <PlayerModal 
                    isOpen={isModalOpen} 
                    setIsOpen={setIsModalOpen} 
                    onAddPlayer={handleAddPlayer} 
                />
            </div>
        </div>
    );
}

export default GroupPage;
