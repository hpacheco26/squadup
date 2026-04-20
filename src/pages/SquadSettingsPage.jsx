import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, LogOut, Trash2, Wallet, X } from 'lucide-react';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import PlayerCard from '../components/cards/PlayerCard';
import PlayerModal from '../components/modals/PlayerModal';
import SquadSettingsHeaderBar from '../components/bars/SquadSettingsHeaderBar';
import useLanguageStore from '../store/languageStore';
import GameDebtService from '../api/gameDebtService';

function SquadSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { group, subscribeToGroup, updateGroup, deleteGroup } = useGroupStore();

    const [groupName, setGroupName] = useState('');
    const [treasuryPhone, setTreasuryPhone] = useState('');
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [gameDebts, setGameDebts] = useState([]);
    const { user } = useAuthStore();
    const { t } = useLanguageStore();
    const saveTimerRef = useRef(null);
    const phoneSaveTimerRef = useRef(null);

    const isAdmin = group?.adminIds?.includes(user?.uid) || group?.adminId === user?.uid;

    // Subscribe to group for real-time updates
    useEffect(() => {
        const unsubGroup = subscribeToGroup(id);
        const unsubDebts = GameDebtService.subscribeToGameDebtsByGroup(id, setGameDebts);
        return () => { unsubGroup(); unsubDebts(); };
    }, [id, subscribeToGroup]);

    useEffect(() => {
        if (group?.name) {
            setGroupName(group.name);
        }
        setTreasuryPhone(group?.treasuryPhone || '');
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

    const handleToggleAdmin = (player) => {
        if (!player.userId) return;
        const currentAdminIds = group.adminIds || (group.adminId ? [group.adminId] : []);
        const isPlayerAdmin = currentAdminIds.includes(player.userId);
        if (isPlayerAdmin && currentAdminIds.length <= 1) return; // prevent removing last admin
        const newAdminIds = isPlayerAdmin
            ? currentAdminIds.filter(id => id !== player.userId)
            : [...currentAdminIds, player.userId];
        updateGroup(group.id, { ...group, adminIds: newAdminIds });
    };

    if (!group) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('loading')}</p>;

    return (
        <>
            <SquadSettingsHeaderBar 
                group={group} 
                navigate={navigate} 
            />
            
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 56px)' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 16px 0' }}>
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
                                {t('groupName')}
                            </label>
                            <input
                                type="text"
                                placeholder={t('enterGroupName')}
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

                    {/* Treasury - admin only */}
                    {isAdmin && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '12px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                <Wallet size={14} color="#5b7bb3" />
                                <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                    {t('treasury')}
                                </label>
                            </div>
                            <label style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>{t('treasuryPlayer')}</label>
                            <select
                                value={group.treasuryPlayerId || (group.players || []).find(p => group.adminIds?.includes(p.userId) || p.userId === group.adminId)?.id || ''}                                onChange={handleTreasuryPlayerChange}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '0.95rem',
                                    color: '#1e293b',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    background: '#fff',
                                    marginBottom: '10px',
                                }}
                            >
                                <option value="">{t('selectPlayer')}</option>
                                {(group.players ?? []).map(p => (
                                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName || ''}</option>
                                ))}
                            </select>
                            <label style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>MBWay Phone</label>
                            <input
                                type="tel"
                                placeholder="912345678"
                                value={treasuryPhone}
                                onChange={handleTreasuryPhoneChange}
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

                    {/* Debts - admin only */}
                    {isAdmin && (() => {
                        // Compute per-player debt totals from gameDebts
                        const playerDebtMap = {};
                        gameDebts.forEach(gd => {
                            Object.entries(gd.debts || {}).forEach(([playerId, info]) => {
                                if (!info.paid) {
                                    if (!playerDebtMap[playerId]) playerDebtMap[playerId] = 0;
                                    playerDebtMap[playerId] += info.amount;
                                }
                            });
                        });
                        const playersWithDebt = (group.players ?? []).filter(p => (playerDebtMap[p.id] || 0) > 0);
                        if (playersWithDebt.length === 0) return null;
                        const totalDebt = Object.values(playerDebtMap).reduce((sum, v) => sum + v, 0);

                        const handleClearDebt = async (playerId) => {
                            for (const gd of gameDebts) {
                                if (gd.debts?.[playerId] && !gd.debts[playerId].paid) {
                                    await GameDebtService.markPlayerPaid(gd.id, playerId);
                                    const allPaid = Object.entries(gd.debts || {}).every(([id, info]) =>
                                        id === playerId || info.paid
                                    );
                                    if (allPaid) await GameDebtService.deleteGameDebt(gd.id);
                                }
                            }
                        };

                        return (
                            <div style={{
                                background: '#fff',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '12px',
                                border: '1px solid #e2e8f0',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                        {t('outstandingDebts')}
                                    </label>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#dc2626' }}>€{totalDebt.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {playersWithDebt.map(player => (
                                        <div key={player.id} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            padding: '8px 10px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca',
                                        }}>
                                            <div>
                                                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#1e293b' }}>
                                                    {player.firstName} {player.lastName?.[0] ? `${player.lastName[0]}.` : ''}
                                                </span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#dc2626', marginLeft: '8px' }}>
                                                    €{(playerDebtMap[player.id] || 0).toFixed(2)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleClearDebt(player.id)}
                                                style={{
                                                    background: '#dcfce7', border: 'none', borderRadius: '6px',
                                                    padding: '4px 10px', fontSize: '0.75rem', fontWeight: '600',
                                                    color: '#16a34a', cursor: 'pointer',
                                                }}
                                            >
                                                {t('clear')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Players - admin only */}
                    {isAdmin && (
                        <div style={{
                            background: '#fff',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '12px',
                            border: '1px solid #e2e8f0',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
                                <label style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                    {t('playersLabel')} ({(group.players ?? []).length})
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {(group.players ?? []).length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.9rem' }}>{t('noPlayersYet')}</p>
                                ) : (
                                    (group.players ?? []).map((player) => {
                                        const currentAdminIds = group.adminIds || (group.adminId ? [group.adminId] : []);
                                        const isPlayerAdmin = player.userId && currentAdminIds.includes(player.userId);
                                        const canToggle = player.userId && (!isPlayerAdmin || currentAdminIds.length > 1);
                                        return (
                                        <div key={player.id} style={{ position: 'relative' }}>
                                            <PlayerCard 
                                                player={player}
                                                onRemovePlayer={handleRemovePlayer}
                                            />
                                            {player.userId ? (
                                                <button
                                                    onClick={() => canToggle && handleToggleAdmin(player)}
                                                    title={isPlayerAdmin ? t('removeAdmin') : t('makeAdmin')}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '6px',
                                                        right: '48px',
                                                        fontSize: '0.55rem',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        padding: '2px 6px',
                                                        borderRadius: '6px',
                                                        background: isPlayerAdmin ? '#fef9c3' : '#f1f5f9',
                                                        color: isPlayerAdmin ? '#ca8a04' : '#94a3b8',
                                                        border: 'none',
                                                        cursor: canToggle ? 'pointer' : 'not-allowed',
                                                    }}
                                                >
                                                    {isPlayerAdmin ? `★ ${t('admin')}` : t('user')}
                                                </button>
                                            ) : (
                                                <span style={{
                                                    position: 'absolute',
                                                    top: '6px',
                                                    right: '48px',
                                                    fontSize: '0.55rem',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    padding: '2px 6px',
                                                    borderRadius: '6px',
                                                    background: '#f1f5f9',
                                                    color: '#94a3b8',
                                                }}>
                                                    {t('noUser')}
                                                </span>
                                            )}
                                        </div>
                                        );
                                    })
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
                            <Trash2 size={16} /> {t('deleteGroup')}
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
                            <LogOut size={16} /> {t('leaveGroup')}
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
