import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import PlayerCard from '../components/cards/PlayerCard';
import PlayerModal from '../components/modals/PlayerModal';
import { Button } from 'react-bulma-components';
import SquadSettingsHeaderBar from '../components/bars/SquadSettingsHeaderBar';

function SquadSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, fetchGroupById, updateGroup, deleteGroup } = useGroupStore();

    const [groupName, setGroupName] = useState('');
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

    // Ensure `fetchGroupById` doesn't trigger unnecessary renders
    const fetchGroup = useCallback(() => fetchGroupById(id), [id, fetchGroupById]);

    useEffect(() => {
        fetchGroup();
    }, [fetchGroup]);

    useEffect(() => {
        if (group?.name) {
            setGroupName(group.name);
        }
    }, [group]);

    const handleUpdateGroup = () => {
        if (groupName.trim()) {
            updateGroup(group.id, { ...group, name: groupName });
            navigate(`/groups/${group.id}`);
        }
    };

    const handleDeleteGroup = () => {
        deleteGroup(group.id);
        navigate('/groups');
    };

    const handleAddPlayer = (newPlayer) => {
        if (!group) return;
        const updatedPlayers = [...(group.players ?? []), newPlayer];
        updateGroup(group.id, { ...group, players: updatedPlayers }).then(fetchGroup);
    };

    const handleRemovePlayer = (playerId) => {
        if (!group) return;
        const updatedPlayers = (group.players ?? []).filter(player => player.id !== playerId);
        updateGroup(group.id, { ...group, players: updatedPlayers }).then(fetchGroup);
    };

    return (
        <>
            <SquadSettingsHeaderBar 
                group={group} 
                groupName={groupName}
                setGroupName={setGroupName}
                updateGroup={updateGroup} 
                navigate={navigate} 
            />
            
            <div className="container p-4" style={{display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
                {/* Group Name Input */}
                <div className="field" style={{height: "100px", borderBottom: "2px solid #e2e8f0"}} >
                    {/* <label className="label">Group Name</label> */}
                    <input
                        className="input subtitle"
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                </div>

                {/* Players List (Scrollable) */}
                {/* <div style={{  overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}> */}
                    {/* Single Column Layout , background: "#f3f4f6" */}
                    <div className="columns is-multiline" style={{  overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px'}}>
                        {(group.players ?? []).map((player) => (
                            <div className="column is-full" style={{ padding: '5px 0px'}} key={player.id}>  
                                <PlayerCard 
                                    player={player}
                                    onRemovePlayer={handleRemovePlayer}
                                />
                            </div>
                        ))}
                    </div>
                {/* </div> */}

                {/* Add Player Modal */}
                <PlayerModal 
                    isOpen={isPlayerModalOpen} 
                    setIsOpen={setIsPlayerModalOpen} 
                    onAddPlayer={handleAddPlayer} 
                />

                {/* Centered Buttons */}
                <div className="buttons is-centered" style={{ display: "flex", gap: "20px" }}>
                    <Button style={{background:"#0d9488", color:"#fff", flex:"1"}} onClick={() => setIsPlayerModalOpen(true)}>
                        Add Player
                    </Button>

                    <Button style={{background:"#ef4444", color:"#fff", flex:"1"}} onClick={handleDeleteGroup}>
                        Delete Group
                    </Button>
                </div>
            </div>
        </>
    );
}

export default SquadSettingsPage;
