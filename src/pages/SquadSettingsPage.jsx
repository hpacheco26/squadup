import React, { useState } from 'react';
import { Wallet, Trash2, LogOut, UserPlus, AlertCircle, Shield, UserCheck, UserX } from 'lucide-react';
import PlayerCard from '../components/cards/PlayerCard';
import PlayerModal from '../components/modals/PlayerModal';
import AppHeaderBar from '../components/bars/AppHeaderBar';
import { BottomSheet, ConfirmSheet } from '../components/modals/BottomSheet';
import {
    SectionLabel, SettingsGroup, SettingsRow, settingsInputStyle,
} from '../components/lists/SettingsList';
import useLanguageStore from '../store/languageStore';
import useSquadSettings from './_useSquadSettings';

function SquadSettingsPage() {
    const { t } = useLanguageStore();
    const s = useSquadSettings();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [treasuryOpen, setTreasuryOpen] = useState(false);
    if (!s.group) return <p style={{ textAlign: 'center', padding: 40, color: 'var(--c-text-muted)' }}>{t('loading')}</p>;

    const adminCount = s.sortedPlayers.filter(p => p.userId && s.currentAdminIds.includes(p.userId)).length;
    const memberCount = s.sortedPlayers.filter(p => p.userId && !s.currentAdminIds.includes(p.userId)).length;
    const nonMemberCount = s.sortedPlayers.filter(p => !p.userId).length;

    return (
        <>
            <AppHeaderBar onBack={() => s.navigate(`/groups/${s.group.id}`)} />

            <div style={{ padding: '20px 0 32px', maxWidth: 640, margin: '0 auto' }}>

                {/* GROUP NAME */}
                {s.isAdmin && (
                    <>
                        <SectionLabel>{t('groupName')}</SectionLabel>
                        <SettingsGroup>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px' }}>
                                <input
                                    type="text"
                                    placeholder={t('enterGroupName')}
                                    value={s.groupName}
                                    onChange={s.handleGroupNameChange}
                                    onBlur={s.handleUpdateGroup}
                                    style={{ ...settingsInputStyle, textAlign: 'left' }}
                                />
                            </div>
                        </SettingsGroup>
                    </>
                )}

                {/* TREASURY */}
                {s.isAdmin && (() => {
                    const treasurerId = s.group.treasuryPlayerId
                        || (s.group.players || []).find(p => s.currentAdminIds.includes(p.userId))?.id
                        || '';
                    const treasurer = (s.group.players || []).find(p => p.id === treasurerId);
                    const treasurerName = treasurer
                        ? `${treasurer.firstName}${treasurer.lastName ? ' ' + treasurer.lastName : ''}`
                        : t('noTreasurerSet');
                    const isTreasurerAdmin = treasurer && s.currentAdminIds.includes(treasurer.userId);
                    const ring = isTreasurerAdmin ? '#d4a817' : 'var(--c-primary)';
                    const tint = isTreasurerAdmin ? '#fef9c3' : 'var(--c-primary-light)';
                    const textColor = isTreasurerAdmin ? '#a37610' : 'var(--c-primary)';
                    const initials = treasurer
                        ? `${(treasurer.firstName || '?')[0]}${(treasurer.lastName || '')[0] || ''}`.toUpperCase()
                        : '?';
                    return (
                        <>
                            <SectionLabel>{t('treasury')}</SectionLabel>
                            <SettingsGroup footer="MBWay phone is used for in-app payment links">
                                {/* Treasurer chip row */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 14px',
                                    borderBottom: '1px solid var(--c-border)',
                                }}>
                                    <div style={{
                                        flexShrink: 0,
                                        width: 40, height: 40, borderRadius: '50%',
                                        background: treasurer ? tint : 'var(--c-surface-alt)',
                                        color: treasurer ? textColor : 'var(--c-text-muted)',
                                        border: `2px solid ${treasurer ? ring : 'var(--c-border)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 700,
                                    }}>
                                        {initials}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            margin: 0, fontSize: '0.95rem', fontWeight: 600,
                                            color: treasurer ? textColor : 'var(--c-text-muted)',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {treasurerName}
                                        </p>
                                        <span style={{
                                            display: 'inline-block', marginTop: 3,
                                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: 0.5,
                                            textTransform: 'uppercase',
                                            color: treasurer ? textColor : 'var(--c-text-muted)',
                                            background: treasurer ? tint : 'var(--c-surface-alt)',
                                            padding: '2px 8px', borderRadius: 999,
                                        }}>
                                            {t('treasuryPlayer')}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setTreasuryOpen(true)}
                                        style={{
                                            background: 'transparent', border: 'none',
                                        color: 'var(--c-primary)', fontSize: '0.85rem', fontWeight: 600,
                                            cursor: 'pointer', fontFamily: 'inherit', padding: '6px 4px',
                                        }}
                                    >
                                        {t('change') || 'Change'}
                                    </button>
                                </div>
                                {/* MBWay row */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '12px 14px',
                                }}>
                                    <Wallet size={16} color="var(--c-primary)" />
                                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: 'var(--c-text)' }}>
                                        MBWay
                                    </p>
                                    <input
                                        type="tel"
                                        placeholder="912345678"
                                        value={s.treasuryPhone}
                                        onChange={s.handleTreasuryPhoneChange}
                                        style={settingsInputStyle}
                                    />
                                </div>
                            </SettingsGroup>
                        </>
                    );
                })()}

                {/* DEBTS */}
                {s.isAdmin && s.playersWithDebt.length > 0 && (
                    <>
                        <SectionLabel>{t('outstandingDebts')} · €{s.totalDebt.toFixed(2)}</SectionLabel>
                        <SettingsGroup>
                            {s.playersWithDebt.map((p, i, arr) => (
                                <SettingsRow
                                    key={p.id}
                                    label={`${p.firstName} ${p.lastName?.[0] ? `${p.lastName[0]}.` : ''}`}
                                    icon={AlertCircle}
                                    danger
                                    chevron={false}
                                    last={i === arr.length - 1}
                                >
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--c-danger)' }}>
                                        €{(s.playerDebtMap[p.id] || 0).toFixed(2)}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); s.handleClearDebt(p.id); }}
                                        style={{
                                            marginLeft: 8, background: 'var(--c-success-light)', border: 'none',
                                            borderRadius: 6, padding: '4px 10px', fontSize: '0.7rem',
                                            fontWeight: 700, color: 'var(--c-success)', cursor: 'pointer',
                                        }}
                                    >{t('clear')}</button>
                                </SettingsRow>
                            ))}
                        </SettingsGroup>
                    </>
                )}

                {/* MEMBERS */}
                {s.isAdmin && (
                    <>
                        <SectionLabel
                            action={
                                <button
                                    className="btn-primary"
                                    onClick={() => s.setIsPlayerModalOpen(true)}
                                    style={{
                                        background: 'var(--c-primary)', color: '#fff', border: 'none',
                                        borderRadius: 8, padding: '4px 8px', fontSize: '0.7rem',
                                        fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 4,
                                    }}
                                ><UserPlus size={12} /> {t('addPlayer')}</button>
                            }
                        >
                            {t('playersLabel')}
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginLeft: 8, textTransform: 'none', letterSpacing: 0 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-warning)' }}>
                                    <Shield size={11} strokeWidth={2.5} /> {adminCount}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-primary)' }}>
                                    <UserCheck size={11} strokeWidth={2.5} /> {memberCount}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: 'var(--c-text-muted)' }}>
                                    <UserX size={11} strokeWidth={2.5} /> {nonMemberCount}
                                </span>
                            </span>
                        </SectionLabel>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
                            {s.sortedPlayers.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--c-text-muted)', padding: 20, fontSize: '0.9rem' }}>{t('noPlayersYet')}</p>
                            ) : s.sortedPlayers.map((player) => {
                                const isPlayerAdmin = !!(player.userId && s.currentAdminIds.includes(player.userId));
                                const canToggle = s.isAdmin && player.userId && (!isPlayerAdmin || s.currentAdminIds.length > 1);
                                return (
                                    <PlayerCard
                                        key={player.id}
                                        player={player}
                                        isAdmin={isPlayerAdmin}
                                        canManageAdmins={canToggle}
                                        onToggleAdmin={s.handleToggleAdmin}
                                        onRemovePlayer={s.isAdmin ? s.handleRemovePlayer : undefined}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}

                {/* DANGER */}
                <SettingsGroup>
                    <SettingsRow
                        label={s.isAdmin ? t('deleteGroup') : t('leaveGroup')}
                        icon={s.isAdmin ? Trash2 : LogOut}
                        danger
                        onClick={() => setConfirmOpen(true)}
                        last
                    />
                </SettingsGroup>
            </div>

            <PlayerModal isOpen={s.isPlayerModalOpen} setIsOpen={s.setIsPlayerModalOpen} onAddPlayer={s.handleAddPlayer} />

            <BottomSheet open={treasuryOpen} onClose={() => setTreasuryOpen(false)} title={t('treasuryPlayer')}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '50vh', overflowY: 'auto' }}>
                    {(s.group.players ?? []).map(p => {
                        const selected = (s.group.treasuryPlayerId
                            || (s.group.players || []).find(x => s.currentAdminIds.includes(x.userId))?.id) === p.id;
                        const isAdmin = s.currentAdminIds.includes(p.userId);
                        const ring = isAdmin ? '#d4a817' : 'var(--c-primary)';
                        const tint = isAdmin ? '#fef9c3' : 'var(--c-primary-light)';
                        const textColor = isAdmin ? '#a37610' : 'var(--c-primary)';
                        const initials = `${(p.firstName || '?')[0]}${(p.lastName || '')[0] || ''}`.toUpperCase();
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                    s.handleTreasuryPlayerChange({ target: { value: p.id } });
                                    setTreasuryOpen(false);
                                }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '10px 12px', borderRadius: 12,
                                    background: selected ? 'var(--c-primary-light)' : 'var(--c-surface)',
                                    border: `1px solid ${selected ? 'var(--c-primary)' : 'var(--c-border)'}`,
                                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                }}
                            >
                                <div style={{
                                    flexShrink: 0,
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: tint, color: textColor,
                                    border: `2px solid ${ring}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700,
                                }}>
                                    {initials}
                                </div>
                                <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 600, color: 'var(--c-text)' }}>
                                    {p.firstName} {p.lastName || ''}
                                </span>
                                {selected && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--c-primary)' }}>✓</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </BottomSheet>

            <ConfirmSheet
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                    setConfirmOpen(false);
                    if (s.isAdmin) s.handleDeleteGroup(); else s.handleLeaveGroup();
                }}
                title={s.isAdmin
                    ? (t('deleteGroupConfirmTitle') || 'Delete this group?')
                    : (t('leaveGroupConfirmTitle') || 'Leave this group?')}
                confirmLabel={s.isAdmin ? t('deleteGroup') : t('leaveGroup')}
                cancelLabel={t('cancel') || 'Cancel'}
            />
        </>
    );
}

export default SquadSettingsPage;
