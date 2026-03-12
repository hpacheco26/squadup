import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Wallet, Check, X as XIcon, Send, Smartphone, Banknote, ChevronLeft, ChevronRight } from 'lucide-react';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';

const PaymentsPage = () => {
    const { groupId } = useParams();
    const { games, subscribeToGamesByGroup, togglePayment } = useGameStore();
    const { group, subscribeToGroup, clearPlayerDebt } = useGroupStore();
    const { user } = useAuthStore();
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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

    if (!group) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading...</p>;

    const groupPlayers = group.players || [];
    const treasuryId = group.treasuryPlayerId || null;

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

    // Games with unpaid players (for carousel) — only ended games with a price
    const unpaidGames = (games || []).filter(g => {
        if (g.status !== 'ended') return false;
        const price = Number(g.price) || 0;
        if (price === 0) return false;
        const allInGame = getAllInGamePlayers(g);
        const payments = g.payments || {};
        return allInGame.some(p => !isAutoPaid(p) && !payments[p.id]);
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
        const unpaidCount = allInGame.filter(p => !isAutoPaid(p) && !payments[p.id]).length;
        return sum + (unpaidCount * perPlayer);
    }, 0);

    const handleClearPlayer = async (playerId) => {
        // Mark player as paid in ended games only (not open/upcoming)
        const allGames = games || [];
        for (const g of allGames) {
            if (g.status !== 'ended') continue;
            const allInGame = getAllInGamePlayers(g);
            const isInGame = allInGame.some(p => p.id === playerId);
            const payments = g.payments || {};
            if (isInGame && !payments[playerId]) {
                await togglePayment(g.id, playerId);
            }
        }
        // Clear group-level debt
        await clearPlayerDebt(groupId, playerId);
    };

    const handleSendMBWay = () => {
        window.location.href = 'mbway://';
    };

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
                    <Wallet size={20} color="#5b7bb3" />
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        Payments
                    </h1>
                </div>
                <span style={{
                    fontSize: '0.8rem', fontWeight: '700',
                    color: totalOwed === 0 ? '#16a34a' : '#e07070',
                    background: totalOwed === 0 ? '#dcfce7' : '#fef2f2',
                    padding: '4px 12px', borderRadius: '20px',
                }}>
                    {totalOwed === 0 ? '✓ All Games Paid' : `€${totalOwed.toFixed(2)} owed`}
                </span>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* MBWay card */}
                {group.treasuryPhone && (
                    <div style={{
                        background: '#fff',
                        borderRadius: '12px',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                            <Smartphone size={14} color="#5b7bb3" />
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                MBWay — {treasuryPlayer ? `${treasuryPlayer.firstName} ${treasuryPlayer.lastName?.[0] || ''}`.trim() : 'Treasury'}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            background: '#f0f5ff', borderRadius: '10px', padding: '12px 14px',
                        }}>
                            <p style={{
                                fontSize: '1.3rem', fontWeight: 'bold', color: '#5b7bb3',
                                margin: 0, letterSpacing: '2px', flex: 1, fontFamily: 'monospace',
                            }}>
                                {group.treasuryPhone}
                            </p>
                            <button
                                onClick={() => navigator.clipboard.writeText(group.treasuryPhone)}
                                style={{
                                    background: '#e2e8f0', border: 'none', borderRadius: '8px',
                                    padding: '8px 14px', fontSize: '0.75rem', fontWeight: '600',
                                    color: '#64748b', cursor: 'pointer',
                                }}
                            >
                                Copy
                            </button>
                        </div>
                        <button
                            onClick={handleSendMBWay}
                            style={{
                                width: '100%', marginTop: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                padding: '12px', borderRadius: '10px', border: 'none',
                                background: '#e07070', color: '#fff',
                                fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
                                letterSpacing: '0.5px',
                            }}
                        >
                            <Send size={16} /> Open MBWay
                        </button>
                    </div>
                )}

                {/* Game debts carousel */}
                {unpaidGames.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                                Game Debts ({unpaidGames.length})
                            </span>
                            {unpaidGames.length > 1 && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button onClick={() => scroll(-1)} disabled={!canScrollLeft}
                                        style={{ background: 'none', border: 'none', cursor: canScrollLeft ? 'pointer' : 'default', opacity: canScrollLeft ? 1 : 0.3, padding: '2px' }}>
                                        <ChevronLeft size={18} color="#64748b" />
                                    </button>
                                    <button onClick={() => scroll(1)} disabled={!canScrollRight}
                                        style={{ background: 'none', border: 'none', cursor: canScrollRight ? 'pointer' : 'default', opacity: canScrollRight ? 1 : 0.3, padding: '2px' }}>
                                        <ChevronRight size={18} color="#64748b" />
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
                                const paidCount = allInGame.filter(p => isAutoPaid(p) || payments[p.id]).length;
                                const unpaidCount = allInGame.length - paidCount;
                                const owedInGame = unpaidCount * perPlayer;
                                return (
                                    <div key={g.id} style={{
                                        minWidth: '240px',
                                        background: 'linear-gradient(135deg, #5b7bb3, #4a6a9e)',
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
                                        {/* Progress bar */}
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

                {totalOwed === 0 && (
                    <div style={{
                        textAlign: 'center', padding: '24px 20px', color: '#16a34a',
                        background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7',
                    }}>
                        <Check size={28} color="#16a34a" style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>All games paid</p>
                    </div>
                )}

                {/* All group players */}
                <div style={{
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    flex: 1,
                }}>
                    <div style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #e2e8f0',
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                            Players ({visiblePlayers.length})
                        </span>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                    {visiblePlayers.map((player, index) => {
                        const debt = player.debt || 0;
                        const gamesUnpaid = player.gamesUnpaid || 0;
                        const isMe = myGroupPlayer && player.id === myGroupPlayer.id;
                        const hasDebt = debt > 0;
                        return (
                            <div key={player.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px',
                                borderBottom: index < visiblePlayers.length - 1 ? '1px solid #f1f5f9' : 'none',
                                background: hasDebt ? '#fffbeb' : '#fff',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                                        background: hasDebt ? '#fee2e2' : '#dcfce7',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {hasDebt
                                            ? <XIcon size={16} color="#dc2626" />
                                            : <Check size={16} color="#16a34a" />
                                        }
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <span style={{
                                            fontSize: '0.9rem', color: '#1e293b', fontWeight: '500',
                                            display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {player.firstName} {player.lastName?.[0] ? `${player.lastName[0]}.` : ''}
                                            {isMe && <span style={{ fontSize: '0.65rem', color: '#5b7bb3', marginLeft: '4px' }}>(you)</span>}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: hasDebt ? '#dc2626' : '#16a34a', fontWeight: '500' }}>
                                            {hasDebt
                                                ? `${gamesUnpaid} game${gamesUnpaid !== 1 ? 's' : ''} unpaid`
                                                : 'All games paid'
                                            }
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                                    <span style={{
                                        fontSize: '0.9rem', fontWeight: '700',
                                        color: hasDebt ? '#e07070' : '#16a34a',
                                    }}>
                                        €{debt.toFixed(2)}
                                    </span>
                                    {canManage && hasDebt && (
                                        <button
                                            onClick={() => handleClearPlayer(player.id)}
                                            style={{
                                                background: '#dcfce7', border: '1px solid #bbf7d0',
                                                borderRadius: '8px',
                                                padding: '6px 10px', fontSize: '0.7rem', fontWeight: '600',
                                                color: '#16a34a', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                            }}
                                        >
                                            <Check size={14} /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentsPage;
