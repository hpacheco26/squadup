import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, Check, X as XIcon, Send, Smartphone, ChevronLeft, ChevronRight, Bell, Copy, Share2 } from 'lucide-react';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import theme from '../theme';
import useLanguageStore from '../store/languageStore';

const PaymentsPage = () => {
    const { groupId } = useParams();
    const { games, subscribeToGamesByGroup, togglePayment } = useGameStore();
    const { group, subscribeToGroup } = useGroupStore();
    const { user } = useAuthStore();
    const { t } = useLanguageStore();
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [iPaidSent, setIPaidSent] = useState(false);

    useEffect(() => {
        if (!groupId) return;
        const unsub = subscribeToGroup(groupId);
        return unsub;
    }, [groupId, subscribeToGroup]);

    useEffect(() => {
        if (!groupId) return;
        const unsub = subscribeToGamesByGroup(groupId);
        return unsub;
    }, [groupId, subscribeToGamesByGroup]);

    const updateScrollButtons = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    useEffect(() => {
        updateScrollButtons();
    }, [games]);

    const scroll = (dir) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 260, behavior: 'smooth' });
    };

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

    // All players except treasury
    const visiblePlayers = groupPlayers.filter(p => p.id !== treasuryId);

    // Helper: get all in-game players (including guests) for a game
    const getAllInGamePlayers = (g) => {
        const seen = new Set();
        const players = [];
        for (const p of [...(g.playersIn || []), ...(g.team1 || []), ...(g.team2 || []), ...(g.injured || [])]) {
            if (!seen.has(p.id)) {
                seen.add(p.id);
                players.push(p);
            }
        }
        return players;
    };

    // Treasury and guests added by treasury are always considered paid
    const isAutoPaid = (p) => p.id === treasuryId || (p.guest && p.addedBy === treasuryId);

    // A player is effectively paid if: auto-paid, directly paid, or a guest whose adder has paid
    const isPlayerPaid = (p, payments) => {
        if (isAutoPaid(p)) return true;
        if (payments[p.id]) return true;
        if (p.guest && p.addedBy && payments[p.addedBy]) return true;
        return false;
    };

    // Games with unpaid players (for carousel) — only ended games with a price
    const unpaidGames = (games || []).filter(g => {
        if (g.status !== 'ended') return false;
        const price = Number(g.price) || 0;
        if (price === 0) return false;
        const allInGame = getAllInGamePlayers(g);
        const payments = g.payments || {};
        return allInGame.some(p => !isPlayerPaid(p, payments));
    }).sort((a, b) => {
        // Most recent first
        const da = new Date(`${a.date}T${a.time || '00:00'}`);
        const db = new Date(`${b.date}T${b.time || '00:00'}`);
        return db - da;
    });

    // Total owed across all unpaid games
    const totalOwed = unpaidGames.reduce((sum, g) => {
        const price = Number(g.price) || 0;
        const allInGame = getAllInGamePlayers(g);
        const perPlayer = g.perPlayerCost || (allInGame.length > 0 ? price / allInGame.length : 0);
        const payments = g.payments || {};
        const unpaidCount = allInGame.filter(p => !isPlayerPaid(p, payments)).length;
        return sum + (unpaidCount * perPlayer);
    }, 0);

    // Compute each player's debt from game data (source of truth)
    const getPlayerDebt = (playerId) => {
        let debt = 0;
        let gamesUnpaid = 0;
        for (const g of (games || [])) {
            if (g.status !== 'ended') continue;
            const price = Number(g.price) || 0;
            if (price === 0) continue;
            const allInGame = getAllInGamePlayers(g);
            const playerInGame = allInGame.find(p => p.id === playerId);
            if (!playerInGame) continue;
            const payments = g.payments || {};
            if (!isPlayerPaid(playerInGame, payments)) {
                const perPlayer = g.perPlayerCost || (allInGame.length > 0 ? price / allInGame.length : 0);
                debt += perPlayer;
                gamesUnpaid++;
            }
        }
        return { debt, gamesUnpaid };
    };

    const handleClearPlayer = async (playerId) => {
        // Mark player as paid in ended games only (not open/upcoming)
        const allGames = games || [];
        for (const g of allGames) {
            if (g.status !== 'ended') continue;
            const allInGame = getAllInGamePlayers(g);
            const payments = g.payments || {};
            // Mark the player as paid
            const isInGame = allInGame.some(p => p.id === playerId);
            if (isInGame && !payments[playerId]) {
                await togglePayment(g.id, playerId);
            }
            // Also mark any guests they added as paid
            for (const p of allInGame) {
                if (p.guest && p.addedBy === playerId && !payments[p.id]) {
                    await togglePayment(g.id, p.id);
                }
            }
        }
    };

    const handleSendMBWay = () => {
        window.location.href = 'mbway://';
    };

    const handleSharePayments = () => {
        const groupName = group?.name || 'Group';
        const playersWithDebt = visiblePlayers
            .map(p => ({ ...p, ...getPlayerDebt(p.id) }))
            .filter(p => p.debt > 0);
        let msg = `💰 ${groupName} — Payments\n\n`;
        if (playersWithDebt.length === 0) {
            msg += '✅ All players have paid!\n';
        } else {
            msg += `Total owed: €${totalOwed.toFixed(2)}\n\n`;
            for (const p of playersWithDebt) {
                const name = `${p.firstName} ${p.lastName?.[0] ? p.lastName[0] + '.' : ''}`.trim();
                msg += `❌ ${name} — €${p.debt.toFixed(2)} (${p.gamesUnpaid} game${p.gamesUnpaid !== 1 ? 's' : ''})\n`;
            }
        }
        if (group.treasuryPhone) {
            msg += `\nMBWay: ${group.treasuryPhone}`;
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const myDebtInfo = myGroupPlayer ? getPlayerDebt(myGroupPlayer.id) : { debt: 0, gamesUnpaid: 0 };
    const myDebt = myDebtInfo.debt;
    const myGamesUnpaid = myDebtInfo.gamesUnpaid;

    const handleIPaid = async () => {
        if (!myGroupPlayer || myDebt <= 0) return;
        await handleClearPlayer(myGroupPlayer.id);
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
                                        {myGamesUnpaid} game{myGamesUnpaid !== 1 ? 's' : ''} unpaid
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

                {/* Game debts carousel */}
                {unpaidGames.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                {t('gameDebts')} ({unpaidGames.length})
                            </span>
                            {unpaidGames.length > 1 && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => scroll(-1)} disabled={!canScrollLeft}
                                        style={{ background: 'none', border: 'none', cursor: canScrollLeft ? 'pointer' : 'default', opacity: canScrollLeft ? 1 : 0.3, padding: '2px' }}>
                                        <ChevronLeft size={18} color={theme.textSecondary} />
                                    </button>
                                    <button onClick={() => scroll(1)} disabled={!canScrollRight}
                                        style={{ background: 'none', border: 'none', cursor: canScrollRight ? 'pointer' : 'default', opacity: canScrollRight ? 1 : 0.3, padding: '2px' }}>
                                        <ChevronRight size={18} color={theme.textSecondary} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div
                            ref={scrollRef}
                            onScroll={updateScrollButtons}
                            style={{
                                display: 'flex',
                                gap: '12px',
                                overflowX: 'auto',
                                scrollSnapType: 'x mandatory',
                                WebkitOverflowScrolling: 'touch',
                                paddingBottom: '4px',
                                msOverflowStyle: 'none',
                                scrollbarWidth: 'none',
                            }}
                        >
                            {unpaidGames.map(g => {
                                const price = Number(g.price) || 0;
                                const allInGame = getAllInGamePlayers(g);
                                const payments = g.payments || {};
                                const perPlayer = g.perPlayerCost || (allInGame.length > 0 ? price / allInGame.length : 0);
                                const paidCount = allInGame.filter(p => isPlayerPaid(p, payments)).length;
                                const unpaidCount = allInGame.length - paidCount;
                                const owedInGame = unpaidCount * perPlayer;
                                return (
                                    <div key={g.id} style={{
                                        minWidth: '240px',
                                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
                                        borderRadius: '14px',
                                        padding: '16px',
                                        color: '#fff',
                                        scrollSnapAlign: 'start',
                                        flexShrink: 0,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{g.date}</span>
                                            <span style={{
                                                fontSize: '0.65rem', fontWeight: '600',
                                                background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px',
                                            }}>
                                                {paidCount}/{allInGame.length} paid
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 6px' }}>
                                            €{owedInGame.toFixed(2)}
                                        </p>
                                        <p style={{ fontSize: '0.7rem', opacity: 0.7, margin: 0 }}>
                                            €{perPlayer.toFixed(2)} × {unpaidCount} unpaid
                                        </p>
                                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '3px', height: '4px', marginTop: '10px' }}>
                                            <div style={{
                                                background: '#fff',
                                                height: '100%',
                                                borderRadius: '3px',
                                                width: `${allInGame.length > 0 ? (paidCount / allInGame.length) * 100 : 0}%`,
                                                transition: 'width 0.4s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
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

                {/* All group players */}
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
                        const { debt, gamesUnpaid } = getPlayerDebt(player.id);
                        const isMe = myGroupPlayer && player.id === myGroupPlayer.id;
                        const hasDebt = debt > 0;
                        return (
                            <div key={player.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px',
                                borderBottom: index < visiblePlayers.length - 1 ? `1px solid ${theme.border}` : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                        background: hasDebt ? theme.dangerLight : theme.successLight,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {hasDebt
                                            ? <XIcon size={16} color={theme.danger} />
                                            : <Check size={16} color={theme.success} />
                                        }
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{
                                            fontSize: '0.9rem', color: theme.text, fontWeight: '500',
                                            display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {player.firstName} {player.lastName?.[0] ? `${player.lastName[0]}.` : ''}
                                            {isMe && <span style={{ fontSize: '0.65rem', color: theme.primary, marginLeft: '4px' }}>({t('you')})</span>}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: hasDebt ? theme.danger : theme.success, fontWeight: '500' }}>
                                            {hasDebt
                                                ? `${gamesUnpaid} ${gamesUnpaid !== 1 ? t('gamesUnpaid') : t('gameUnpaid')}`
                                                : t('allGamesPaid')
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                                    <span style={{
                                        fontSize: '0.9rem', fontWeight: '700',
                                        color: hasDebt ? theme.danger : theme.success,
                                    }}>
                                        €{debt.toFixed(2)}
                                    </span>
                                    {canManage && hasDebt && (
                                        <button
                                            onClick={() => handleClearPlayer(player.id)}
                                            style={{
                                                background: theme.successLight, border: 'none',
                                                borderRadius: '8px',
                                                padding: '6px 10px', fontSize: '0.7rem', fontWeight: '600',
                                                color: theme.success, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                            }}
                                        >
                                            <Check size={14} /> {t('clear')}
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
