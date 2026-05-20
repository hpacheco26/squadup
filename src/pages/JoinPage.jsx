import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useInviteStore from '../store/inviteStore';
import useAuthStore from '../store/authStore';
import useGroupStore from '../store/groupStore';
import GroupService from '../api/groupService';
import useLanguageStore from '../store/languageStore';
import PaywallModal from '../components/modals/PaywallModal';

function JoinPage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user, playerData, canJoinMoreGroups } = useAuthStore();
    const { fetchInviteByCode, invite, loading } = useInviteStore();
    const { fetchGroupById } = useGroupStore();
    const { t } = useLanguageStore();

    const [group, setGroup] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | pick | already | joined | error
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);
    const [showPaywall, setShowPaywall] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const inv = await fetchInviteByCode(code);
                if (!inv || !inv.active) {
                    setStatus('error');
                    return;
                }
                const grp = await GroupService.getGroupById(inv.groupId);
                if (!grp) {
                    setStatus('error');
                    return;
                }
                setGroup(grp);

                // Check if user is already a linked player in this group
                const alreadyLinked = grp.players.some(p => p.userId === user.uid);
                if (alreadyLinked) {
                    setStatus('already');
                    return;
                }
                setStatus('pick');
            } catch (err) {
                console.error('JoinPage load error:', err);
                setStatus('error');
            }
        }
        if (user) {
            load();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code, user]);

    const handleClaimPlayer = async (player) => {
        if (!group) return;
        const allowed = await canJoinMoreGroups();
        if (!allowed) {
            setPendingAction(() => () => handleClaimPlayer(player));
            setShowPaywall(true);
            return;
        }
        const uid = user.uid;
        const updatedPlayers = group.players.map(p =>
            p.id === player.id
                ? { ...p, userId: uid }
                : p
        );
        await GroupService.updateGroup(group.id, { players: updatedPlayers });
        setStatus('joined');
    };

    const handleJoinAsNew = async () => {
        if (!group) return;
        const allowed = await canJoinMoreGroups();
        if (!allowed) {
            setPendingAction(() => handleJoinAsNew);
            setShowPaywall(true);
            return;
        }
        const uid = user.uid;
        // Derive name: prefer playerData, fall back to displayName or email
        const displayName = user.displayName || user.email?.split('@')[0] || 'Player';
        const firstName = playerData?.firstName || displayName.split(' ')[0];
        const lastName = playerData?.lastName || displayName.split(' ').slice(1).join(' ') || '';
        const newPlayer = {
            id: playerData?.id || `${displayName.replaceAll(' ', '.')}-${uid}`,
            firstName,
            lastName,
            userId: uid,
            rank: 0,
            stats: { wins: 0, draws: 0, losses: 0 },
        };
        const updatedPlayers = [...group.players, newPlayer];
        await GroupService.updateGroup(group.id, { players: updatedPlayers });
        setStatus('joined');
    };

    if (status === 'loading' || loading) {
        return (
            <div style={styles.container}>
                <p style={styles.message}>{t('loadingInvite')}</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>{t('invalidInvite')}</p>
                    <p style={styles.subtitle}>{t('invalidInviteMsg')}</p>
                    <button style={styles.button} onClick={() => navigate('/')}>{t('goHome')}</button>
                </div>
            </div>
        );
    }

    if (status === 'already') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>{t('alreadyMember')}</p>
                    <p style={styles.subtitle}>{t('alreadyMemberMsg', { group: group?.name })}</p>
                    <button style={styles.button} onClick={() => navigate(`/groups/${group.id}`)}>{t('goToGroup')}</button>
                </div>
            </div>
        );
    }

    if (status === 'joined') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>{t('youreIn')}</p>
                    <p style={styles.subtitle}>{t('welcomeTo', { group: group?.name })}</p>
                    <button style={styles.button} onClick={() => navigate(`/groups/${group.id}`)}>{t('goToGroup')}</button>
                </div>
            </div>
        );
    }

    // status === 'pick'
    const unlinkedPlayers = (group?.players || []).filter(p => !p.userId);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <p style={styles.title}>{t('joinGroup', { group: group?.name })}</p>
                <p style={styles.subtitle}>{t('areYouOneOfThese')}</p>

                {unlinkedPlayers.length > 0 && (
                    <div style={styles.playerList}>
                        {unlinkedPlayers.map(player => (
                            <button
                                key={player.id}
                                style={{
                                    ...styles.playerItem,
                                    border: selectedPlayerId === player.id ? '2px solid var(--c-primary)' : '1px solid var(--c-border)',
                                    background: selectedPlayerId === player.id ? 'var(--c-primary-light)' : 'var(--c-surface)',
                                }}
                                onClick={() => setSelectedPlayerId(player.id)}
                            >
                                {player.firstName} {player.lastName}
                            </button>
                        ))}
                    </div>
                )}

                {selectedPlayerId && (
                    <button
                        className="btn-primary"
                        style={styles.button}
                        onClick={() => handleClaimPlayer(unlinkedPlayers.find(p => p.id === selectedPlayerId))}
                    >
                        {t('thatsMe')}
                    </button>
                )}

                <div style={{ margin: '16px 0', color: '#94a3b8', fontSize: '0.85rem' }}>— {t('or')} —</div>

                <button className="btn-primary" style={{ ...styles.button, background: '#64748b' }} onClick={handleJoinAsNew}>
                    {t('joinAs', { name: [
                        playerData?.firstName || user.displayName?.split(' ')[0] || '',
                        playerData?.lastName  || user.displayName?.split(' ').slice(1).join(' ') || '',
                    ].join(' ').trim() || user.email?.split('@')[0] || 'me' })}
                </button>
            </div>
        </div>
        <PaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            onSuccess={() => {
                setShowPaywall(false);
                if (pendingAction) pendingAction();
            }}
        />
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
    },
    card: {
        background: '#fff',
        borderRadius: '16px',
        padding: '32px 24px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#64748b',
        marginBottom: '20px',
    },
    message: {
        fontSize: '1rem',
        color: '#64748b',
    },
    playerList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '16px',
    },
    playerItem: {
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '1rem',
        cursor: 'pointer',
        textAlign: 'left',
        background: '#fff',
    },
    button: {
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        border: 'none',
        background: 'var(--c-primary)',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

export default JoinPage;
