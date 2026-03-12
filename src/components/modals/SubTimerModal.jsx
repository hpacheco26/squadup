import React, { useState, useMemo } from 'react';
import { Modal } from 'react-bulma-components';
import { ArrowLeftRight } from 'lucide-react';

/**
 * Builds a sub order for a team based on subCounts.
 * Players with fewest subs go first. Within same count, original order is preserved.
 */
const getSubOrder = (team, subCounts) => {
    return [...team].sort((a, b) => {
        const countA = subCounts[a.id] || 0;
        const countB = subCounts[b.id] || 0;
        if (countA !== countB) return countA - countB;
        return team.indexOf(a) - team.indexOf(b);
    });
};

const SubTimerModal = ({ team1, team2, team1Label, team2Label, subCounts = {}, isOpen, onClose, onAcceptSub }) => {
    const order1 = useMemo(() => getSubOrder(team1, subCounts), [team1, subCounts]);
    const order2 = useMemo(() => getSubOrder(team2, subCounts), [team2, subCounts]);

    const [selected1, setSelected1] = useState(null);
    const [selected2, setSelected2] = useState(null);

    // Reset selections when modal opens
    const pick1 = selected1 && order1.find(p => p.id === selected1) ? selected1 : order1[0]?.id;
    const pick2 = selected2 && order2.find(p => p.id === selected2) ? selected2 : order2[0]?.id;

    const handleAccept = () => {
        onAcceptSub?.({ team1PlayerId: pick1, team2PlayerId: pick2 });
        setSelected1(null);
        setSelected2(null);
    };

    const handleClose = () => {
        setSelected1(null);
        setSelected2(null);
        onClose?.();
    };

    const renderCarousel = (order, selectedId, onSelect, teamColor) => (
        <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            padding: '8px 4px',
            WebkitOverflowScrolling: 'touch',
        }}>
            {order.map((player, idx) => {
                const isSelected = player.id === selectedId;
                const count = subCounts[player.id] || 0;
                const isNext = idx === 0 && !selected1 && !selected2;
                return (
                    <button
                        key={player.id}
                        onClick={() => onSelect(player.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 14px',
                            borderRadius: '10px',
                            border: isSelected ? `2px solid ${teamColor}` : '2px solid transparent',
                            background: isSelected ? `${teamColor}12` : '#f8fafc',
                            cursor: 'pointer',
                            flexShrink: 0,
                            minWidth: '72px',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: isSelected ? teamColor : '#e2e8f0',
                            color: isSelected ? '#fff' : '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                        }}>
                            {(player.firstName?.[0] || '').toUpperCase()}{(player.lastName?.[0] || '').toUpperCase()}
                        </div>
                        <span style={{
                            fontSize: '0.7rem',
                            fontWeight: isSelected ? '700' : '500',
                            color: isSelected ? teamColor : '#475569',
                            whiteSpace: 'nowrap',
                            maxWidth: '64px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}>
                            {player.firstName}
                        </span>
                        <span style={{
                            fontSize: '0.55rem',
                            color: '#94a3b8',
                            fontWeight: '600',
                        }}>
                            {count} sub{count !== 1 ? 's' : ''}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    return (
        <Modal show={isOpen} onClose={handleClose} closeOnEsc={false} closeOnBlur={false}>
            <Modal.Card>
                <Modal.Card.Header>
                    <Modal.Card.Title style={{ textAlign: 'center', width: '100%', fontSize: '1.1rem', fontWeight: '700' }}>
                        Substitution Time!
                    </Modal.Card.Title>
                </Modal.Card.Header>
                <Modal.Card.Body style={{ padding: '12px 16px' }}>
                    {/* Team 1 */}
                    <div style={{ marginBottom: '12px' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#0d9488', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {team1Label || 'Team 1'} — Sub Out
                        </p>
                        {renderCarousel(order1, pick1, setSelected1, '#0d9488')}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0' }}>
                        <ArrowLeftRight size={16} color="#94a3b8" />
                    </div>

                    {/* Team 2 */}
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#e11d48', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {team2Label || 'Team 2'} — Sub Out
                        </p>
                        {renderCarousel(order2, pick2, setSelected2, '#e11d48')}
                    </div>
                </Modal.Card.Body>
                <Modal.Card.Footer style={{ justifyContent: 'center', padding: '12px' }}>
                    <button
                        onClick={handleAccept}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'linear-gradient(135deg, #5b7bb3, #4a6694)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 32px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            letterSpacing: '0.5px',
                        }}
                    >
                        <ArrowLeftRight size={16} strokeWidth={2.5} />
                        Rotate
                    </button>
                </Modal.Card.Footer>
            </Modal.Card>
        </Modal>
    );
};

export default SubTimerModal;
