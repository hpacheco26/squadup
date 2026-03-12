import React from "react";
import { CheckCircle, XCircle, Clock, Lock, UserCheck, UserX, Mail, MapPin, Calendar, Users, Euro } from "lucide-react";
import getMyInviteStatus from "../../utils/myInviteStatus";
import useAuthStore from '../../store/authStore';

const statusConfig = {
    open: { bg: '#dbeafe', color: '#1d4ed8', icon: <Clock size={14} />, label: 'Open' },
    confirmed: { bg: '#dcfce7', color: '#16a34a', icon: <CheckCircle size={14} />, label: 'Confirmed' },
    closed: { bg: '#dcfce7', color: '#16a34a', icon: <Lock size={14} />, label: 'Closed' },
    cancelled: { bg: '#fee2e2', color: '#dc2626', icon: <XCircle size={14} />, label: 'Cancelled' }
};

const inviteConfig = {
    in: { bg: '#dcfce7', color: '#16a34a', icon: <UserCheck size={14} />, label: "I'm In" },
    out: { bg: '#fee2e2', color: '#dc2626', icon: <UserX size={14} />, label: "I'm Out" },
    invited: { bg: '#fef3c7', color: '#d97706', icon: <Mail size={14} />, label: "Invited" }
};

const GameCard = ({ game }) => {
    const status = statusConfig[game.status] || { bg: '#f1f5f9', color: '#64748b', icon: null, label: game.status };
    const { playerData } = useAuthStore();

    const myInviteStatus = getMyInviteStatus(game, playerData.id);
    const invite = inviteConfig[myInviteStatus] || { bg: '#f1f5f9', color: '#64748b', icon: null, label: "—" };

    const playersIn = (game.playersIn || []).length;
    const playersInvited = (game.playersInvited || []).length;
    const total = playersIn + playersInvited + (game.playersOut || []).length;
    const fillPercent = total > 0 ? (playersIn / total) * 100 : 0;

    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
        }}>
            {/* Top row: Location + Status badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                    <div style={{
                        background: '#f1f5f9',
                        borderRadius: '10px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <MapPin size={18} color="#5b7bb3" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p
                            onClick={game.location ? (e) => { e.stopPropagation(); window.open(game.locationUrl || `https://www.google.com/maps/search/${encodeURIComponent(game.location)}`, '_blank'); } : undefined}
                            style={{
                                fontSize: '1rem', fontWeight: '700', color: game.location ? '#5b7bb3' : '#1e293b', margin: 0,
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                cursor: game.location ? 'pointer' : 'inherit',
                                textDecoration: game.location ? 'underline' : 'none',
                            }}
                        >
                            {game.location}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Calendar size={12} color="#94a3b8" />
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                                {game.date} · {game.time}
                            </p>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    {game.price > 0 && (
                        <span style={{
                            background: '#f0fdf4',
                            color: '#16a34a',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            padding: '4px 8px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            whiteSpace: 'nowrap',
                        }}>
                            <Euro size={12} /> {Number(game.price).toFixed(0)}
                        </span>
                    )}
                    <span style={{
                        background: status.bg,
                        color: status.color,
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                    }}>
                        {status.icon} {status.label}
                    </span>
                </div>
            </div>

            {/* Player bar */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={13} color="#64748b" />
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                            {playersIn} in · {playersInvited} pending
                        </span>
                    </div>
                    <span style={{
                        background: invite.bg,
                        color: invite.color,
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        {invite.icon} {invite.label}
                    </span>
                </div>
                <div style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: '#e2e8f0',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%',
                        width: `${fillPercent}%`,
                        borderRadius: '2px',
                        background: 'linear-gradient(90deg, #5b7bb3, #7c9fd4)',
                        transition: 'width 0.4s ease',
                    }} />
                </div>
            </div>
        </div>
    );
};

export default GameCard;
