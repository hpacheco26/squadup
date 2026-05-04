import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Users, Plus, Check } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useGroupStore from '../store/groupStore';
import useLanguageStore from '../store/languageStore';
import GroupService from '../api/groupService';
import CreateGroupModal from './modals/GroupModal';

/**
 * Header dropdown that lets the user pick the active group.
 * Tap the group name to open a popover listing all the user's groups.
 */
function GroupSwitcher() {
    const { user, selectedGroupId, setSelectedGroupId } = useAuthStore();
    const { groups } = useGroupStore();
    const { t } = useLanguageStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [canCreate, setCanCreate] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (user?.uid) GroupService.canCreateGroup(user.uid).then(setCanCreate);
    }, [user?.uid]);

    // Default to the first group when none is selected yet
    useEffect(() => {
        if (!selectedGroupId && groups.length > 0) {
            setSelectedGroupId(groups[0].id);
        }
    }, [selectedGroupId, groups, setSelectedGroupId]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [open]);

    const selected = groups.find((g) => g.id === selectedGroupId);
    const label = selected?.name || (groups.length === 0 ? (t('noGroupsYet') || 'No groups') : (t('selectGroup') || 'Select group'));

    const handlePick = (g) => {
        setSelectedGroupId(g.id);
        setOpen(false);
        // Keep the user on the same conceptual page when possible.
        // Routes that carry a groupId in the URL get rewritten in place.
        // Routes tied to a gameId (pregame/teams/game/game settings) fall back
        // to the new group's hub since the game belongs to the old group.
        const path = location.pathname;
        const groupRouteMatch = path.match(/^\/(groups|payments)\/[^/]+(\/.*)?$/);
        if (groupRouteMatch) {
            const [, base, rest = ''] = groupRouteMatch;
            navigate(`/${base}/${g.id}${rest}`);
        } else {
            navigate(`/groups/${g.id}`);
        }
    };

    return (
        <div ref={wrapperRef} style={{ position: 'relative' }}>
            <button
                type="button"
                onClick={() => groups.length > 0 || canCreate ? setOpen((v) => !v) : null}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: 'none',
                    padding: '6px 8px', borderRadius: 8,
                    cursor: (groups.length > 0 || canCreate) ? 'pointer' : 'default',
                    color: 'var(--c-text)',
                }}
            >
                <Users size={18} color="#5b7bb3" />
                <span style={{
                    fontSize: '1rem', fontWeight: 700,
                    maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                    {label}
                </span>
                {(groups.length > 0 || canCreate) && (
                    <ChevronDown
                        size={16}
                        color="#94a3b8"
                        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
                    />
                )}
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                        minWidth: 240, maxWidth: 320,
                        background: 'var(--c-surface)', borderRadius: 12,
                        border: '1px solid var(--c-border)',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                        zIndex: 50,
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                        {groups.length === 0 ? (
                            <p style={{ margin: 0, padding: '14px', fontSize: '0.85rem', color: 'var(--c-text-muted)', textAlign: 'center' }}>
                                {t('noGroupsYet') || 'No groups yet'}
                            </p>
                        ) : groups.map((g, i) => {
                            const isSelected = g.id === selectedGroupId;
                            return (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => handlePick(g)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        width: '100%', padding: '10px 14px',
                                        background: isSelected ? 'var(--c-surface-hover)' : 'var(--c-surface)',
                                        border: 'none',
                                        borderBottom: i === groups.length - 1 && !canCreate ? 'none' : '1px solid var(--c-border)',
                                        cursor: 'pointer', textAlign: 'left',
                                        color: 'var(--c-text)', fontSize: '0.9rem',
                                        fontWeight: isSelected ? 600 : 500,
                                    }}
                                >
                                    <Users size={14} color={isSelected ? '#5b7bb3' : '#94a3b8'} />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {g.name}
                                    </span>
                                    {isSelected && <Check size={14} color="#5b7bb3" />}
                                </button>
                            );
                        })}
                    </div>

                    {canCreate && (
                        <button
                            type="button"
                            onClick={() => { setOpen(false); setCreateOpen(true); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                width: '100%', padding: '12px 14px',
                                background: 'var(--c-surface-alt)', border: 'none',
                                borderTop: '1px solid var(--c-border)',
                                cursor: 'pointer', textAlign: 'left',
                                color: '#5b7bb3', fontSize: '0.85rem', fontWeight: 600,
                            }}
                        >
                            <Plus size={14} /> {t('createGroup')}
                        </button>
                    )}
                </div>
            )}

            <CreateGroupModal isOpen={createOpen} setIsOpen={setCreateOpen} />
        </div>
    );
}

export default GroupSwitcher;
