import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Columns, Card } from 'react-bulma-components';
import PlayersList from '../components/lists/PlayersList';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import PlayerModal from '../components/modals/PlayerModal';
import GameModal from '../components/modals/GameModal';
import { FiSettings } from 'react-icons/fi';
import { Share2, UserPlus, Link as LinkIcon, ClipboardList } from 'lucide-react';

const PreGamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { game, subscribeToGame, handlePlayerOut, handlePlayerIn, updateGame, loading } = useGameStore();
    const { group, subscribeToGroup } = useGroupStore();
    const { user } = useAuthStore();
    const [playersIn, setPlayersIn] = useState([]);
    const [playersOut, setPlayersOut] = useState([]);
    const [playersInvited, setPlayersInvited] = useState([]);
    const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);

    useEffect(() => {
        const unsub = subscribeToGame(gameId);
        return unsub;
    }, [gameId, subscribeToGame]);

    useEffect(() => {
        if (loading) return;
        if (!game) {
            const gId = group?.id;
            if (gId) navigate(`/groups/${gId}`, { replace: true });
            else navigate('/', { replace: true });
            return;
        }
        if (game.status && game.status !== 'open' && game.status !== 'confirmed') {
            navigate(`/groups/${game.groupId}`, { replace: true });
        }
    }, [game, loading, group?.id, navigate]);

    // Ensure the correct group is loaded for the back button
    useEffect(() => {
        if (game?.groupId) {
            const unsub = subscribeToGroup(game.groupId);
            return unsub;
        }
    }, [game?.groupId, subscribeToGroup]);

    useEffect(() => {
        if (game) {
            setPlayersIn(game.playersIn || []);
            setPlayersOut(game.playersOut || []);
            setPlayersInvited(game.playersInvited || []);
        }
    }, [game]);

    // Sync new group members into the game's invited list
    useEffect(() => {
        if (!game || !group || game.status !== 'open') return;
        // Ensure the loaded group matches this game's group
        if (group.id !== game.groupId) return;
        const allGamePlayerIds = new Set([
            ...(game.playersInvited || []).map(p => p.id),
            ...(game.playersIn || []).map(p => p.id),
            ...(game.playersOut || []).map(p => p.id),
        ]);
        const newPlayers = (group.players || []).filter(p => !allGamePlayerIds.has(p.id));
        if (newPlayers.length > 0) {
            updateGame(gameId, {
                playersInvited: [...(game.playersInvited || []), ...newPlayers],
            });
        }
    }, [game?.id, group?.players?.length]);

    const handleAddGuest = (guestPlayer) => {
        if (!game) return;
        const myPlayer = group?.players?.find(p => p.userId === user?.uid);
        const guest = { ...guestPlayer, guest: true, addedBy: myPlayer?.id || null };
        const updatedPlayersIn = [...(game.playersIn || []), guest];
        updateGame(gameId, { playersIn: updatedPlayersIn });
    };

    const buildGameSummary = () => {
        const inNames = (game.playersIn || []).map(p => p.firstName).join(', ');
        const outNames = (game.playersOut || []).map(p => p.firstName).join(', ');
        const pendingNames = (game.playersInvited || []).map(p => p.firstName).join(', ');
        const dateStr = game.date || '';
        const timeStr = game.time || '';
        const loc = game.location || '';
        const groupName = group?.name || '';

        let msg = `⚽ ${groupName} — Game Day!\n`;
        if (dateStr) msg += `📅 ${dateStr}${timeStr ? ` at ${timeStr}` : ''}\n`;
        if (loc) msg += `📍 ${loc}\n`;
        const mapsLink = game.locationUrl || (loc ? `https://www.google.com/maps/search/${encodeURIComponent(loc)}` : null);
        if (mapsLink) msg += `🗺️ ${mapsLink}\n`;
        msg += `\n`;
        msg += `✅ IN (${(game.playersIn || []).length}): ${inNames || 'none'}\n`;
        msg += `❌ OUT (${(game.playersOut || []).length}): ${outNames || 'none'}\n`;
        msg += `❓ PENDING (${(game.playersInvited || []).length}): ${pendingNames || 'none'}\n`;
        msg += `\nRespond here: ${window.location.origin}/game-invite/${gameId}`;
        return msg;
    };

    const handleShareWhatsApp = () => {
        const message = buildGameSummary();
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleCopyInviteLink = () => {
        const link = `${window.location.origin}/game-invite/${gameId}`;
        navigator.clipboard.writeText(link);
    };

    if (!game) return <div>Loading...</div>;

    return (
        <>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ClipboardList size={20} color="#5b7bb3" />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        {group?.name || 'PreGame'}
                    </h1>
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        color: '#64748b',
                        background: '#f1f5f9',
                        borderRadius: '10px',
                        padding: '2px 8px',
                    }}>
                        {playersIn.length} in
                    </span>
                </div>
                <button onClick={() => setIsGameModalOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#94a3b8' }} aria-label="Game Settings">
                    <FiSettings size={22} />
                </button>
            </header>

            <div className="p-2" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '12px' }}>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '4px 0', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setIsGuestModalOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}
                    >
                        <UserPlus size={14} /> Guest
                    </button>
                    <button
                        onClick={handleShareWhatsApp}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#4CAF7D', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                        <Share2 size={14} /> WhatsApp
                    </button>
                    <button
                        onClick={handleCopyInviteLink}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}
                    >
                        <LinkIcon size={14} /> Link
                    </button>
                </div>

                <div>
                    <PlayersList 
                        players={playersIn}
                        leftSwipe={(playerId) => handlePlayerOut(gameId, playerId)}
                        statusLabel="IN"
                        user={user}
                        isAdmin={game.adminId === user.uid}
                    />
                </div>

                <hr style={{ margin: '4px 0', border: 'none', borderTop: '2px solid #cbd5e1' }} />

                <div>
                    <PlayersList
                        players={playersOut}
                        rightSwipe={(playerId) => handlePlayerIn(gameId, playerId)}
                        statusLabel="OUT"
                        user={user}
                        isAdmin={game.adminId === user.uid}
                    />
                </div>

                <div>
                    <PlayersList
                        players={playersInvited}
                        rightSwipe={(playerId) => handlePlayerIn(gameId, playerId)}
                        leftSwipe={(playerId) => handlePlayerOut(gameId, playerId)}
                        statusLabel="?"
                        user={user}
                        isAdmin={game.adminId === user.uid}
                        
                    />
                </div>

                {/* Guest Player Modal */}
                <PlayerModal
                    isOpen={isGuestModalOpen}
                    setIsOpen={setIsGuestModalOpen}
                    onAddPlayer={handleAddGuest}
                    title="Guest Player"
                    buttonLabel="Add Guest"
                />
                <GameModal isOpen={isGameModalOpen} setIsOpen={setIsGameModalOpen} group={group} game={game} />
            </div>
        </>
    );
};

export default PreGamePage;
