import React, { useState, useEffect } from 'react';
import { Link, Copy, Check, Share2 } from 'lucide-react';
import useGroupStore from '../../store/groupStore';
import useAuthStore from '../../store/authStore';
import useInviteStore from '../../store/inviteStore';
import useLanguageStore from '../../store/languageStore';

function PlayerModal({ isOpen, setIsOpen, onAddPlayer }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const { group } = useGroupStore();
    const { user } = useAuthStore();
    const { createInvite } = useInviteStore();
    const [inviteLink, setInviteLink] = useState('');
    const [copied, setCopied] = useState(false);
    const { t } = useLanguageStore();

    useEffect(() => {
        if (isOpen) {
            setFirstName('');
            setLastName('');
            setInviteLink('');
            setCopied(false);
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!firstName.trim()) return;
        const newPlayer = {
            id: crypto.randomUUID(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            rank: 0,
            stats: { wins: 0, draws: 0, losses: 0 },
            userId: null,
        };
        onAddPlayer(newPlayer);
        setFirstName('');
        setLastName('');
    };

    const handleGenerateInvite = async () => {
        if (!group || !user) return;
        const invite = await createInvite({
            groupId: group.id,
            groupName: group.name,
            createdBy: user.uid,
        });
        if (invite) {
            setInviteLink(`${window.location.origin}/join/${invite.code}`);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareWhatsApp = () => {
        const message = `Join my squad "${group?.name}" on SquadUp! ${inviteLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`} style={{ zIndex: 100 }}>
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '400px',
                margin: 'auto',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>{t('addNewPlayer')}</h3>
                    <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1 }}>×</button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px' }}>
                    {/* Non-member section */}
                    <label style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                        {t('nonMember')}
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        <input
                            type="text"
                            placeholder={t('firstName')}
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9rem',
                                color: '#1e293b',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                        <input
                            type="text"
                            placeholder={t('lastName')}
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '0.9rem',
                                color: '#1e293b',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!firstName.trim()}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '10px',
                            border: 'none',
                            background: firstName.trim() ? '#5b7bb3' : '#cbd5e1',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: firstName.trim() ? 'pointer' : 'default',
                            marginBottom: '20px',
                        }}
                    >
                        {t('addNewPlayer')}
                    </button>

                    {/* Divider */}
                    <div style={{ height: '1px', background: '#e2e8f0', margin: '0 0 20px' }} />

                    {/* Member section */}
                    <label style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
                        {t('member')}
                    </label>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0 0 10px' }}>
                        {t('memberInviteHint')}
                    </p>
                    {!inviteLink ? (
                        <button
                            onClick={handleGenerateInvite}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                background: '#fff',
                                color: '#5b7bb3',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <Link size={16} /> {t('generateInviteLink')}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={handleCopyLink}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    background: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                    color: copied ? '#16a34a' : '#64748b',
                                }}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? t('copied') : t('copyLink')}
                            </button>
                            <button
                                onClick={handleShareWhatsApp}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#4CAF7D',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    fontWeight: '600',
                                    fontSize: '0.85rem',
                                }}
                            >
                                <Share2 size={16} /> WhatsApp
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlayerModal;
