import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import GameDebtService from '../api/gameDebtService';
import PlayerService from '../api/playerService';

/**
 * Shared logic for SquadSettings layout variants.
 * Returns all state, handlers, and derived data.
 */
export default function useSquadSettings() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, subscribeToGroup, updateGroup, deleteGroup, removePlayer } = useGroupStore();
    const { user } = useAuthStore();

    const [groupName, setGroupName] = useState('');
    const [treasuryPhone, setTreasuryPhone] = useState('');
    const [gameDebts, setGameDebts] = useState([]);
    const [memberEmails, setMemberEmails] = useState({});
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const saveTimerRef = useRef(null);
    const phoneSaveTimerRef = useRef(null);
    const fetchedEmailsRef = useRef(new Set());

    const isAdmin = group?.adminIds?.includes(user?.uid) || group?.adminId === user?.uid;
    const currentAdminIds = group?.adminIds || (group?.adminId ? [group.adminId] : []);

    useEffect(() => {
        const unsubGroup = subscribeToGroup(id);
        const unsubDebts = GameDebtService.subscribeToGameDebtsByGroup(id, setGameDebts);
        return () => { unsubGroup(); unsubDebts(); };
    }, [id, subscribeToGroup]);

    useEffect(() => {
        if (group?.name) setGroupName(group.name);
        setTreasuryPhone(group?.treasuryPhone || '');
    }, [group]);

    // Backfill member emails from the global players collection for roster rows
    // created before emails were stamped on the row itself. Each uid is fetched
    // at most once per page visit.
    useEffect(() => {
        const missing = (group?.players ?? []).filter(
            p => p.userId && !p.email && !fetchedEmailsRef.current.has(p.userId)
        );
        if (!missing.length) return;
        missing.forEach(p => fetchedEmailsRef.current.add(p.userId));
        let cancelled = false;
        Promise.all(missing.map(async p => {
            const doc = await PlayerService.getPlayerByUserId(p.userId).catch(() => null);
            return doc?.email ? [p.userId, doc.email] : null;
        })).then(entries => {
            if (cancelled) return;
            const found = Object.fromEntries(entries.filter(Boolean));
            if (Object.keys(found).length) {
                setMemberEmails(prev => ({ ...prev, ...found }));
            }
        });
        return () => { cancelled = true; };
    }, [group]);

    const handleGroupNameChange = (e) => {
        const value = e.target.value;
        setGroupName(value);
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            if (value.trim() && value !== group?.name) updateGroup(group.id, { ...group, name: value });
        }, 800);
    };

    const handleUpdateGroup = () => {
        if (groupName.trim() && groupName !== group?.name) {
            updateGroup(group.id, { ...group, name: groupName });
        }
    };

    const handleTreasuryPlayerChange = (e) => {
        const playerId = e.target.value || null;
        updateGroup(group.id, { ...group, treasuryPlayerId: playerId });
    };

    const handleTreasuryPhoneChange = (e) => {
        const value = e.target.value;
        setTreasuryPhone(value);
        if (phoneSaveTimerRef.current) clearTimeout(phoneSaveTimerRef.current);
        phoneSaveTimerRef.current = setTimeout(() => {
            updateGroup(group.id, { ...group, treasuryPhone: value || null });
        }, 800);
    };

    const handleDeleteGroup = () => { deleteGroup(group.id); navigate('/'); };

    const handleLeaveGroup = () => {
        if (!group || !user) return;
        const updatedPlayers = (group.players ?? []).filter(p => p.userId !== user.uid);
        updateGroup(group.id, { ...group, players: updatedPlayers });
        navigate('/');
    };

    const handleAddPlayer = (newPlayer) => {
        if (!group) return;
        updateGroup(group.id, { ...group, players: [...(group.players ?? []), newPlayer] });
    };

    const handleRemovePlayer = async (playerId) => {
        if (!group) return;
        const player = (group.players ?? []).find(p => p.id === playerId);
        if (!player) return;
        try {
            await removePlayer(group.id, player);
        } catch (error) {
            console.error('[useSquadSettings] Failed to remove player:', error);
        }
    };

    const handleToggleAdmin = (player) => {
        if (!player.userId) return;
        const isPlayerAdmin = currentAdminIds.includes(player.userId);
        if (isPlayerAdmin && currentAdminIds.length <= 1) return;
        const newAdminIds = isPlayerAdmin
            ? currentAdminIds.filter(aid => aid !== player.userId)
            : [...currentAdminIds, player.userId];
        updateGroup(group.id, { ...group, adminIds: newAdminIds });
    };

    // Sorted players: admins → members → non-members (email merged in for members)
    const rank = (p) => {
        if (p.userId && currentAdminIds.includes(p.userId)) return 0;
        if (p.userId) return 1;
        return 2;
    };
    const sortedPlayers = [...(group?.players ?? [])]
        .map(p => {
            const email = p.email || memberEmails[p.userId];
            return email ? { ...p, email } : p;
        })
        .sort((a, b) => {
            const r = rank(a) - rank(b);
            if (r !== 0) return r;
            return (a.firstName || '').localeCompare(b.firstName || '');
        });

    // Debts
    const playerDebtMap = {};
    gameDebts.forEach(gd => {
        Object.entries(gd.debts || {}).forEach(([playerId, info]) => {
            if (!info.paid) playerDebtMap[playerId] = (playerDebtMap[playerId] || 0) + (info.amount || 0);
        });
    });
    const playersWithDebt = (group?.players ?? []).filter(p => (playerDebtMap[p.id] || 0) > 0);
    const totalDebt = playersWithDebt.reduce((sum, p) => sum + (playerDebtMap[p.id] || 0), 0);

    const handleClearDebt = async (playerId) => {
        for (const gd of gameDebts) {
            if (gd.debts?.[playerId] && !gd.debts[playerId].paid) {
                await GameDebtService.markPlayerPaid(gd.id, playerId);
                const allPaid = Object.entries(gd.debts || {}).every(([id, info]) => id === playerId || info.paid);
                if (allPaid) await GameDebtService.deleteGameDebt(gd.id);
            }
        }
    };

    return {
        // navigation / data
        navigate, group, user, isAdmin, currentAdminIds,
        // form state
        groupName, treasuryPhone,
        // modal
        isPlayerModalOpen, setIsPlayerModalOpen,
        // handlers
        handleGroupNameChange, handleUpdateGroup,
        handleTreasuryPlayerChange, handleTreasuryPhoneChange,
        handleDeleteGroup, handleLeaveGroup,
        handleAddPlayer, handleRemovePlayer, handleToggleAdmin,
        // derived
        sortedPlayers, playersWithDebt, playerDebtMap, totalDebt, handleClearDebt,
    };
}
