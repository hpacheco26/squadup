import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import PlayerCard from '../components/cards/PlayerCard';
import PlayerModal from '../components/modals/PlayerModal';
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
            
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', padding: '20px' }}>
                {/* Group Name */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Group Name
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder="Enter group name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                {/* Players */}
                <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    Players ({(group.players ?? []).length})
                </label>
                <div style={{ flex: 1, overflowY: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px', marginBottom: '16px' }}>
                    {(group.players ?? []).length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.9rem' }}>No players yet</p>
                    ) : (
                        (group.players ?? []).map((player) => (
                            <div style={{ padding: '4px 0' }} key={player.id}>
                                <PlayerCard 
                                    player={player}
                                    onRemovePlayer={handleRemovePlayer}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Add Player Modal */}
                <PlayerModal 
                    isOpen={isPlayerModalOpen} 
                    setIsOpen={setIsPlayerModalOpen} 
                    onAddPlayer={handleAddPlayer} 
                />

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="button"
                        style={{ flex: 1, background: '#5b7bb3', color: '#fff', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', padding: '10px' }}
                        onClick={() => setIsPlayerModalOpen(true)}
                    >
                        Add Player
                    </button>
                    <button
                        className="button"
                        style={{ flex: 1, background: '#e07070', color: '#fff', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', padding: '10px' }}
                        onClick={handleDeleteGroup}
                    >
                        Delete Group
                    </button>
                </div>
            </div>
        </>
    );
}

export default SquadSettingsPage;
