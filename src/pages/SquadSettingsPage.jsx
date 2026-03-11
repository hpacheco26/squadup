import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Link, Share2, Copy, Check } from 'lucide-react';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import useInviteStore from '../store/inviteStore';
import PlayerCard from '../components/cards/PlayerCard';
import PlayerModal from '../components/modals/PlayerModal';
import SquadSettingsHeaderBar from '../components/bars/SquadSettingsHeaderBar';

function SquadSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, fetchGroupById, updateGroup, deleteGroup } = useGroupStore();

    const [groupName, setGroupName] = useState('');
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const { user } = useAuthStore();
    const { createInvite } = useInviteStore();

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

    const handleGenerateInvite = async () => {
        if (!group || !user) return;
        const invite = await createInvite({
            groupId: group.id,
            groupName: group.name,
            createdBy: user.uid,
        });
        if (invite) {
            const link = `${window.location.origin}/join/${invite.code}`;
            setInviteLink(link);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const message = `Join my squad "${group.name}" on SquadUp! ${inviteLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        Players ({(group.players ?? []).length})
                    </label>
                    <button
                        onClick={() => setIsPlayerModalOpen(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#6b7280', display: 'flex', alignItems: 'center' }}
                        aria-label="Add Player"
                    >
                        <Plus size={20} />
                    </button>
                </div>
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

                {/* Invite Section */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Invite Players
                    </label>
                    {!inviteLink ? (
                        <button
                            className="button"
                            style={{ width: '100%', background: '#5b7bb3', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={handleGenerateInvite}
                        >
                            <Link size={16} /> Generate Invite Link
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    className="input"
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    style={{ borderRadius: '8px', flex: 1, fontSize: '0.85rem' }}
                                />
                                <button
                                    style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                    onClick={handleCopyLink}
                                >
                                    {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                                </button>
                            </div>
                            <button
                                className="button"
                                style={{ width: '100%', background: '#4CAF7D', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                onClick={handleShareWhatsApp}
                            >
                                <Share2 size={16} /> Share via WhatsApp
                            </button>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
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
