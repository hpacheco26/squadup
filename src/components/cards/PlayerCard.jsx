import React, { useState } from 'react';
import { Trash2, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react';
import useLanguageStore from '../../store/languageStore';
import useThemeStore from '../../store/themeStore';

/**
 * PlayerCard — focused on the *type* of person (Admin / Member / Guest)
 * rather than match performance.
 *
 * Props:
 *  - player: { id, firstName, lastName, userId? }
 *  - isAdmin?: boolean        — is this player an admin of the group
 *  - canManageAdmins?: boolean — viewer can promote/demote
 *  - onToggleAdmin?: (player) => void
 *  - onRemovePlayer?: (playerId) => void
 */
function PlayerCard({ player, isAdmin = false, canManageAdmins = false, onToggleAdmin, onRemovePlayer }) {
    const { id, firstName, lastName, userId } = player;
    const [confirmRemove, setConfirmRemove] = useState(false);
    const { t } = useLanguageStore();
    const { darkMode } = useThemeStore();

    const isGuest = !userId;
    const type = isAdmin ? 'admin' : isGuest ? 'guest' : 'member';

    const palette = {
        admin:  {
            ring: '#d4a817',
            tint: darkMode ? '#2a1f00' : '#fef9c3',
            text: darkMode ? '#fbbf24' : '#a37610',
            label: t('admin'),  Icon: Shield,
        },
        member: {
            ring: 'var(--c-primary)',
            tint: 'var(--c-primary-light)',
            text: 'var(--c-primary)',
            label: t('member'), Icon: UserCheck,
        },
        guest:  {
            ring: darkMode ? '#4a5568' : '#a0aab9',
            tint: darkMode ? '#0d1929' : '#eef0f4',
            text: darkMode ? '#94a3b8' : '#64748b',
            label: t('nonMember'), Icon: UserX,
        },
    }[type];

    const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';

    const handleRemove = () => {
        if (!confirmRemove) {
            setConfirmRemove(true);
            setTimeout(() => setConfirmRemove(false), 3000);
            return;
        }
        if (onRemovePlayer) onRemovePlayer(id);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--c-surface)',
            borderRadius: '12px',
            padding: '12px',
            border: `1px solid ${isAdmin ? `${palette.ring}55` : 'var(--c-border)'}`,
            boxShadow: `inset 4px 0 0 0 ${palette.ring}`,
        }}>
            {/* Avatar with type ring + small icon overlay */}
            <div style={{
                flexShrink: 0,
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: palette.tint,
                color: palette.text,
                border: `2px solid ${palette.ring}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 700,
                position: 'relative',
            }}>
                {initials}
                <span style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--c-surface)',
                    border: `1.5px solid ${palette.ring}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <palette.Icon size={10} color={palette.ring} strokeWidth={2.5} />
                </span>
            </div>

            {/* Name + role pill */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--c-text)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}>
                    {firstName} {lastName}
                </p>
                <span style={{
                    display: 'inline-block',
                    marginTop: '4px',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: palette.text,
                    background: palette.tint,
                    padding: '2px 8px',
                    borderRadius: '999px',
                }}>
                    {palette.label}
                </span>
            </div>

            {/* Admin toggle (linked users only, when viewer can manage) */}
            {canManageAdmins && !isGuest && onToggleAdmin && (
                <button
                    onClick={() => onToggleAdmin(player)}
                    title={isAdmin ? t('removeAdmin') : t('makeAdmin')}
                    style={{
                        flexShrink: 0,
                        background: isAdmin ? palette.tint : 'var(--c-surface-alt)',
                        border: `1px solid ${isAdmin ? '#d4a81755' : 'var(--c-border)'}`,
                        borderRadius: '8px',
                        padding: '6px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: isAdmin ? palette.text : 'var(--c-text-secondary)',
                    }}
                >
                    {isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                </button>
            )}

            {/* Remove */}
            {onRemovePlayer && (
                <button
                    onClick={handleRemove}
                    style={{
                        flexShrink: 0,
                        background: confirmRemove ? '#cf8b90' : 'var(--c-surface-alt)',
                        border: confirmRemove ? 'none' : '1px solid var(--c-border)',
                        borderRadius: '8px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    title={confirmRemove ? 'Tap again to confirm' : 'Remove player'}
                >
                    <Trash2 size={16} color={confirmRemove ? '#fff' : 'var(--c-text-muted)'} />
                </button>
            )}
        </div>
    );
}

export default PlayerCard;
