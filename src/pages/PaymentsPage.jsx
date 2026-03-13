import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, Check, X as XIcon, Send, Smartphone, Copy, Share2 } from 'lucide-react';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import theme from '../theme';
import useLanguageStore from '../store/languageStore';
import GameDebtService from '../api/gameDebtService';

const PaymentsPage = () => {
    const { groupId } = useParams();
    const { group, subscribeToGroup } = useGroupStore();
    const { user } = useAuthStore();
    const { t } = useLanguageStore();
    const [iPaidSent, setIPaidSent] = useState(false);
    const [gameDebts, setGameDebts] = useState([]);

    useEffect(() => {
        if (!groupId) return;
        const unsubGroup = subscribeToGroup(groupId);
        const unsubDebts = GameDebtService.subscribeToGameDebtsByGroup(groupId, (debts) => {
            debts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setGameDebts(debts);
        });
        return () => { unsubGroup(); unsubDebts(); };
    }, [groupId, subscribeToGroup]);

    if (!group) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('loading')}</p>;

    const groupPlayers = group.players || [];
    const adminPlayer = groupPlayers.find(p => p.userId === group.adminId);
    const treasuryId = group.treasuryPlayerId || adminPlayer?.id || null;

    const treasuryPlayer = treasuryId
        ? groupPlayers.find(p => p.id === treasuryId)
        : null;

    const myGroupPlayer = groupPlayers.find(p => p.userId === user?.uid);
    const isTreasury = myGroupPlayer && treasuryId === myGroupPlayer.id;
    const canManage = group.adminId === user?.uid || isTreasury;

    // Compute per-player totals from gameDebts
    const playerTotals = {};
    gameDebts.forEach(gd => {
        Object.entries(gd.debts || {}).forEach(([playerId, info]) => {
            if (!info.paid) {
                if (!playerTotals[playerId]) playerTotals[playerId] = { debt: 0, gamesUnpaid: 0 };
                playerTotals[playerId].debt += (info.amount || 0);
                playerTotals[playerId].gamesUnpaid += 1;
            }
        });
    });

    // All players except treasury
    const visiblePlayers = groupPlayers;

    const getPlayerDebt = (player) => {
        const totals = playerTotals[player.id];
        return {
            debt: totals ? Math.round(totals.debt * 100) / 100 : 0,
            gamesUnpaid: totals ? totals.gamesUnpaid : 0,
        };
    };

    const totalOwed = Object.values(playerTotals).reduce((sum, t) => sum + t.debt, 0);

    const handleClearAllForPlayer = async (playerId) => {
        for (const gd of gameDebts) {
            if (gd.debts?.[playerId] && !gd.debts[playerId].paid) {
                await GameDebtService.markPlayerPaid(gd.id, playerId);
                const allPaid = Object.entries(gd.debts || {}).every(([id, info]) =>
                    id === playerId || info.paid
                );
                if (allPaid) {
                    await GameDebtService.deleteGameDebt(gd.id);
                }
            }
        }
    };

    const handleSendMBWay = () => {
        window.location.href = 'mbway://';
    };

    const handleSharePayments = () => {
        const groupName = group?.name || 'Group';
        const playersWithDebt = visiblePlayers.filter(p => getPlayerDebt(p).debt > 0);
        let msg = `💰 ${groupName} — Payments\n\n`;
        if (playersWithDebt.length === 0) {
            msg += '✅ All players have paid!\n';
        } else {
            msg += `Total owed: €${totalOwed.toFixed(2)}\n\n`;
            for (const p of playersWithDebt) {
                const { debt, gamesUnpaid } = getPlayerDebt(p);
                const name = `${p.firstName} ${p.lastName?.[0] ? p.lastName[0] + '.' : ''}`.trim();
                msg += `❌ ${name} — €${debt.toFixed(2)} (${gamesUnpaid} game${gamesUnpaid !== 1 ? 's' : ''})\n`;
            }
        }
        if (group.treasuryPhone) {
            msg += `\nMBWay: ${group.treasuryPhone}`;
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const myDebtInfo = myGroupPlayer ? getPlayerDebt(myGroupPlayer) : { debt: 0, gamesUnpaid: 0 };
    const myDebt = myDebtInfo.debt;
    const myGamesUnpaid = myDebtInfo.gamesUnpaid;

    const handleIPaid = async () => {
        if (!myGroupPlayer || myDebt <= 0) return;
        await handleClearAllForPlayer(myGroupPlayer.id);
        setIPaidSent(true);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: theme.surface,
                borderBottom: `1px solid ${theme.border}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Wallet size={20} color={theme.primary} />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: theme.text, margin: 0 }}>
                        {t('payments')}
                    </h1>
                </div>
                <span style={{
                    fontSize: '0.8rem', fontWeight: '700',
                    color: totalOwed === 0 ? theme.success : theme.danger,
                    background: totalOwed === 0 ? theme.successLight : theme.dangerLight,
                    padding: '4px 12px', borderRadius: '20px',
                }}>
                    {totalOwed === 0 ? `✓ ${t('allGamesPaid')}` : `€${totalOwed.toFixed(2)} ${t('owed')}`}
                </span>
            </header>

            <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* MBWay card */}
                {group.treasuryPhone && !isTreasury && (
                    <div style={{
                        background: theme.surface,
                        borderRadius: '12px',
                        padding: '16px',
                        border: `1px solid ${theme.border}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <Smartphone size={14} color={theme.primary} />
                            <span style={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                MBWay — {treasuryPlayer ? `${treasuryPlayer.firstName} ${treasuryPlayer.lastName?.[0] || ''}`.trim() : 'Treasury'}
                            </span>
                        </div>

                        {/* Amount to pay */}
                        {myDebt > 0 && (
                            <div style={{
                                background: theme.dangerLight, borderRadius: '10px', padding: '12px 14px',
                                marginBottom: '10px', border: `1px solid ${theme.danger}`,
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.7rem', color: theme.text, margin: '0 0 2px', fontWeight: '600' }}>
                                        {t('amountToPay')}
                                    </p>
                                    <p style={{ fontSize: '1.4rem', fontWeight: '800', color: theme.danger, margin: 0 }}>
                                        €{myDebt.toFixed(2)}
                                    </p>
                                    <p style={{ fontSize: '0.65rem', color: theme.textSecondary, margin: '2px 0 0' }}>
                                        {myGamesUnpaid} {myGamesUnpaid !== 1 ? t('gamesUnpaid') : t('gameUnpaid')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigator.clipboard.writeText(myDebt.toFixed(2))}
                                    style={{
                                        background: theme.dangerLight, border: `1px solid ${theme.danger}`, borderRadius: '8px',
                                        padding: '8px 12px', fontSize: '0.7rem', fontWeight: '600',
                                        color: theme.text, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                    }}
                                >
                                    <Copy size={12} /> {t('copy')}
                                </button>
                            </div>
                        )}

                        {/* Phone number */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: theme.primaryLight, borderRadius: '10px', padding: '12px 14px',
                        }}>
                            <p style={{
                                fontSize: '1.3rem', fontWeight: 'bold', color: theme.primary,
                                margin: 0, letterSpacing: '2px', flex: 1, fontFamily: 'monospace',
                            }}>
                                {group.treasuryPhone}
                            </p>
                            <button
                                onClick={() => navigator.clipboard.writeText(group.treasuryPhone)}
                                style={{
                                    background: theme.border, border: 'none', borderRadius: '8px',
                                    padding: '8px 14px', fontSize: '0.75rem', fontWeight: '600',
                                    color: theme.textSecondary, cursor: 'pointer',
                                }}
                            >
                                {t('copy')}
                            </button>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button
                                onClick={handleSendMBWay}
                                style={{
                                    flex: 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '12px', borderRadius: '10px', border: 'none',
                                    background: theme.primary, color: '#fff',
                                    fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                                }}
                            >
                                <Send size={15} /> {t('openMBWay')}
                            </button>
                            {!isTreasury && myDebt > 0 && (
                                <button
                                    onClick={handleIPaid}
                                    disabled={iPaidSent}
                                    style={{
                                        flex: 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '12px', borderRadius: '10px', border: 'none',
                                        background: iPaidSent ? '#e0f5ee' : '#2a9d6e',
                                        color: iPaidSent ? '#2a9d6e' : '#fff',
                                        fontSize: '0.85rem', fontWeight: '700',
                                        cursor: iPaidSent ? 'default' : 'pointer',
                                        opacity: iPaidSent ? 0.8 : 1,
                                    }}
                                >
                                    {iPaidSent ? <><Check size={15} /> {t('paid')}</> : <><Check size={15} /> {t('paid')}</>}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* WhatsApp share for treasury */}
                {isTreasury && totalOwed > 0 && (
                    <button
                        onClick={handleSharePayments}
                        style={{
                            width: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '12px', borderRadius: '10px', border: 'none',
                            background: '#4CAF7D', color: '#fff',
                            fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
                        }}
                    >
                        <Share2 size={16} /> {t('shareViaWhatsApp')}
                    </button>
                )}

                {/* Players debt list */}
                <div style={{
                    background: theme.surface,
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: `1px solid ${theme.border}`,
                    }}>
                        <span style={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                            {t('playersLabel')} ({visiblePlayers.length})
                        </span>
                    </div>
                    <div>
                    {visiblePlayers.map((player, index) => {
                        const { debt, gamesUnpaid } = getPlayerDebt(player);
                        const isMe = myGroupPlayer && player.id === myGroupPlayer.id;
                        const hasDebt = debt > 0;
                        return (
                            <div key={player.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 16px',
                                borderBottom: index < visiblePlayers.length - 1 ? `1px solid ${theme.border}` : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                        background: hasDebt ? theme.dangerLight : theme.successLight,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {hasDebt
                                            ? <XIcon size={14} color={theme.danger} />
                                            : <Check size={14} color={theme.success} />
                                        }
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{
                                            fontSize: '0.85rem', color: theme.text, fontWeight: '500',
                                            display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {player.firstName} {player.lastName?.[0] ? `${player.lastName[0]}.` : ''}
                                            {isMe && <span style={{ fontSize: '0.6rem', color: theme.primary, marginLeft: '4px' }}>({t('you')})</span>}
                                        </span>
                                        {hasDebt && (
                                            <span style={{ fontSize: '0.7rem', color: theme.danger, fontWeight: '500' }}>
                                                {gamesUnpaid} {gamesUnpaid !== 1 ? t('gamesUnpaid') : t('gameUnpaid')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        fontSize: '0.85rem', fontWeight: '700',
                                        color: hasDebt ? theme.danger : theme.success,
                                    }}>
                                        {hasDebt ? `€${debt.toFixed(2)}` : '✓'}
                                    </span>
                                    {canManage && hasDebt && (
                                        <button
                                            onClick={() => handleClearAllForPlayer(player.id)}
                                            style={{
                                                background: theme.successLight, border: 'none',
                                                borderRadius: '8px',
                                                padding: '4px 8px', fontSize: '0.65rem', fontWeight: '600',
                                                color: theme.success, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '3px',
                                            }}
                                        >
                                            <Check size={12} /> {t('clear')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default PaymentsPage;
