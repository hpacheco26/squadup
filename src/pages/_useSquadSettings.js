import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import GameDebtService from '../api/gameDebtService';

/**
 * Shared logic for SquadSettings layout variants.
 * Returns all state, handlers, and derived data.
 */
export default function useSquadSettings() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, subscribeToGroup, updateGroup, deleteGroup } = useGroupStore();
    const { user } = useAuthStore();

    const [groupName, setGroupName] = useState('');
    const [treasuryPhone, setTreasuryPhone] = useState('');
    const [gameDebts, setGameDebts] = useState([]);
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const saveTimerRef = useRef(null);
    const phoneSaveTimerRef = useRef(null);

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

    const handleRemovePlayer = (playerId) => {
        if (!group) return;
        updateGroup(group.id, { ...group, players: (group.players ?? []).filter(p => p.id !== playerId) });
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

    // Sorted players: admins → members → non-members
    const rank = (p) => {
        if (p.userId && currentAdminIds.includes(p.userId)) return 0;
        if (p.userId) return 1;
        return 2;
    };
    const sortedPlayers = [...(group?.players ?? [])].sort((a, b) => {
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
