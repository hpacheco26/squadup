import React, { useState, useEffect } from 'react';
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
    const { group, subscribeToGroup, updateGroup, deleteGroup } = useGroupStore();

    const [groupName, setGroupName] = useState('');
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const { user } = useAuthStore();
    const { createInvite } = useInviteStore();

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
        if (groupName.trim()) {
            updateGroup(group.id, { ...group, name: groupName });
            navigate(`/groups/${group.id}`);
        }
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

    if (!group) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</p>;

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
                {/* Group Name - admin only */}
                {isAdmin && (
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
                )}

                {/* Players - admin only */}
                {isAdmin && (
                    <>
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
                    </>
                )}

                {/* Bottom actions - always visible, side by side */}
                <div style={{ flexShrink: 0, display: 'flex', gap: '12px' }}>
                    {isAdmin ? (
                        <>
                            {!inviteLink ? (
                                <button
                                    className="button"
                                    style={{ flex: 1, background: '#5b7bb3', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    onClick={handleGenerateInvite}
                                >
                                    <Link size={16} /> Invite
                                </button>
                            ) : (
                                <>
                                    <button
                                        style={{ flex: 1, background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 'bold', color: '#64748b' }}
                                        onClick={handleCopyLink}
                                    >
                                        {copied ? <Check size={16} color="#16a34a" /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
                                    </button>
                                    <button
                                        className="button"
                                        style={{ flex: 1, background: '#4CAF7D', color: '#fff', borderRadius: '8px', fontWeight: 'bold', border: 'none', padding: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                        onClick={handleShareWhatsApp}
                                    >
                                        <Share2 size={16} /> WhatsApp
                                    </button>
                                </>
                            )}
                            <button
                                className="button"
                                style={{ flex: 1, background: '#e07070', color: '#fff', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', padding: '10px' }}
                                onClick={handleDeleteGroup}
                            >
                                Delete
                            </button>
                        </>
                    ) : (
                        <button
                            className="button"
                            style={{ flex: 1, background: '#e07070', color: '#fff', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', padding: '10px' }}
                            onClick={handleLeaveGroup}
                        >
                            Leave Group
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

export default SquadSettingsPage;
