import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, LogOut, Trash2 } from 'lucide-react';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import PlayerCard from '../components/cards/PlayerCard';
import PlayerModal from '../components/modals/PlayerModal';
import SquadSettingsHeaderBar from '../components/bars/SquadSettingsHeaderBar';

function SquadSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, subscribeToGroup, updateGroup, deleteGroup } = useGroupStore();

    const [groupName, setGroupName] = useState('');
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const { user } = useAuthStore();
    const saveTimerRef = useRef(null);

    const isAdmin = group?.adminId === user?.uid;

    // Subscribe to group for real-time updates
    useEffect(() => {
        const unsub = subscribeToGroup(id);
        return unsub;
    }, [id, subscribeToGroup]);

    useEffect(() => {
        if (group?.name) {
            setGroupName(group.name);
        }
    }, [group]);

    const handleUpdateGroup = () => {
        if (groupName.trim() && groupName !== group?.name) {
            updateGroup(group.id, { ...group, name: groupName });
        }
    };

    const handleGroupNameChange = (e) => {
        const value = e.target.value;
        setGroupName(value);
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            if (value.trim() && value !== group?.name) {
                updateGroup(group.id, { ...group, name: value });
            }
        }, 800);
    };

    const handleDeleteGroup = () => {
        deleteGroup(group.id);
        navigate('/');
    };

    const handleLeaveGroup = () => {
        if (!group || !user) return;
        const updatedPlayers = (group.players ?? []).filter(player => player.userId !== user.uid);
        updateGroup(group.id, { ...group, players: updatedPlayers });
        navigate('/');
    };

    const handleAddPlayer = (newPlayer) => {
        if (!group) return;
        const updatedPlayers = [...(group.players ?? []), newPlayer];
        updateGroup(group.id, { ...group, players: updatedPlayers });
    };

    const handleRemovePlayer = (playerId) => {
        if (!group) return;
        const updatedPlayers = (group.players ?? []).filter(player => player.id !== playerId);
        updateGroup(group.id, { ...group, players: updatedPlayers });
    };

    if (!group) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</p>;

    return (
        <>
            <SquadSettingsHeaderBar 
                group={group} 
                navigate={navigate} 
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 16px 0', minHeight: 0 }}>
                    {/* Group Name - admin only */}
                    {isAdmin && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '12px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                                Group Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter group name"
                                value={groupName}
                                onChange={handleGroupNameChange}
                                onBlur={handleUpdateGroup}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.95rem',
                                    color: '#1e293b',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    )}

                    {/* Players - admin only */}
                    {isAdmin && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '12px',
                            border: '1px solid #e2e8f0',
                            flex: 1,
                            minHeight: 0,
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
                                <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                    Players ({(group.players ?? []).length})
                                </label>
                                <button
                                    onClick={() => setIsPlayerModalOpen(true)}
                                    style={{
                                        background: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        color: '#5b7bb3',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    aria-label="Add Player"
                                >
                                    <UserPlus size={18} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
                                {(group.players ?? []).length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.9rem' }}>No players yet</p>
                                ) : (
                                    (group.players ?? []).map((player) => (
                                        <PlayerCard 
                                            key={player.id}
                                            player={player}
                                            onRemovePlayer={handleRemovePlayer}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed bottom action */}
                <div style={{
                    flexShrink: 0,
                    padding: '16px',
                    background: '#f0f2f5',
                    borderTop: '1px solid #e2e8f0',
                }}>
                    {isAdmin ? (
                        <button
                            onClick={handleDeleteGroup}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #fca5a5',
                                background: '#fff',
                                color: '#e07070',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <Trash2 size={16} /> Delete Group
                        </button>
                    ) : (
                        <button
                            onClick={handleLeaveGroup}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #fca5a5',
                                background: '#fff',
                                color: '#e07070',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <LogOut size={16} /> Leave Group
                        </button>
                    )}
                </div>
            </div>

            {/* Add Player Modal */}
            <PlayerModal 
                isOpen={isPlayerModalOpen} 
                setIsOpen={setIsPlayerModalOpen} 
                onAddPlayer={handleAddPlayer} 
            />
        </>
    );
}

export default SquadSettingsPage;
