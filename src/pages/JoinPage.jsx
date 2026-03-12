import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useInviteStore from '../store/inviteStore';
import useAuthStore from '../store/authStore';
import useGroupStore from '../store/groupStore';
import GroupService from '../api/groupService';

function JoinPage() {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user, playerData } = useAuthStore();
    const { fetchInviteByCode, invite, loading } = useInviteStore();
    const { fetchGroupById } = useGroupStore();

    const [group, setGroup] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | pick | already | joined | error
    const [selectedPlayerId, setSelectedPlayerId] = useState(null);

    useEffect(() => {
        async function load() {
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
            if (playerData) {
                const alreadyLinked = grp.players.some(p => p.userId === playerData.userId);
                if (alreadyLinked) {
                    setStatus('already');
                    return;
                }
            }
            setStatus('pick');
        }
        if (user && playerData) {
            load();
        }
    }, [code, user, playerData]);

    // If not logged in, redirect to login with return URL
    useEffect(() => {
        if (!user) {
            sessionStorage.setItem('returnTo', `/join/${code}`);
            navigate('/login');
        }
    }, [user]);

    const handleClaimPlayer = async (player) => {
        if (!group || !playerData) return;
        const updatedPlayers = group.players.map(p =>
            p.id === player.id
                ? { ...p, userId: playerData.userId }
                : p
        );
        await GroupService.updateGroup(group.id, { players: updatedPlayers });
        setStatus('joined');
    };

    const handleJoinAsNew = async () => {
        if (!group || !playerData) return;
        const newPlayer = {
            id: playerData.id,
            firstName: playerData.firstName,
            lastName: playerData.lastName,
            userId: playerData.userId,
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
                <p style={styles.message}>Loading invite...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>Invalid Invite</p>
                    <p style={styles.subtitle}>This invite link is invalid or has expired.</p>
                    <button style={styles.button} onClick={() => navigate('/')}>Go Home</button>
                </div>
            </div>
        );
    }

    if (status === 'already') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>Already a Member</p>
                    <p style={styles.subtitle}>You're already part of <strong>{group?.name}</strong>.</p>
                    <button style={styles.button} onClick={() => navigate(`/groups/${group.id}`)}>Go to Group</button>
                </div>
            </div>
        );
    }

    if (status === 'joined') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <p style={styles.title}>You're In!</p>
                    <p style={styles.subtitle}>Welcome to <strong>{group?.name}</strong>.</p>
                    <button style={styles.button} onClick={() => navigate(`/groups/${group.id}`)}>Go to Group</button>
                </div>
            </div>
        );
    }

    // status === 'pick'
    const unlinkedPlayers = (group?.players || []).filter(p => !p.userId);

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <p style={styles.title}>Join {group?.name}</p>
                <p style={styles.subtitle}>Are you one of these players?</p>

                {unlinkedPlayers.length > 0 && (
                    <div style={styles.playerList}>
                        {unlinkedPlayers.map(player => (
                            <button
                                key={player.id}
                                style={{
                                    ...styles.playerItem,
                                    border: selectedPlayerId === player.id ? '2px solid #5b7bb3' : '1px solid #e2e8f0',
                                    background: selectedPlayerId === player.id ? '#eef2f9' : '#fff',
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
                        style={styles.button}
                        onClick={() => handleClaimPlayer(unlinkedPlayers.find(p => p.id === selectedPlayerId))}
                    >
                        That's Me!
                    </button>
                )}

                <div style={{ margin: '16px 0', color: '#94a3b8', fontSize: '0.85rem' }}>— or —</div>

                <button style={{ ...styles.button, background: '#64748b' }} onClick={handleJoinAsNew}>
                    Join as {playerData?.firstName} {playerData?.lastName}
                </button>
            </div>
        </div>
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
        background: '#5b7bb3',
        color: '#fff',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

export default JoinPage;
