import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../../store/gameStore';
import useAuthStore from '../../store/authStore';
import useLanguageStore from '../../store/languageStore';

function GameModal({ isOpen, setIsOpen, group, game }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [minPlayers, setMinPlayers] = useState(5);
    const [subTime, setSubTime] = useState(5);
    const [recurrence, setRecurrence] = useState('none');
    const [price, setPrice] = useState(0);
    const [invitedPlayers, setInvitedPlayers] = useState(group?.players || []);
    const [groupId, setGroupId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { createGame, updateGame, deleteGame, loading } = useGameStore();
    const { user, playerData } = useAuthStore();
    const navigate = useNavigate();
    const { t } = useLanguageStore();

    const isEditMode = !!game;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setDate(game.date || '');
                setTime(game.time || '');
                setLocation(game.location || '');
                setLocationUrl(game.locationUrl || '');
                setMaxPlayers(game.maxPlayers || 10);
                setMinPlayers(game.minPlayers || 5);
                setSubTime(game.subTime || 5);
                setRecurrence(game.recurrence || 'none');
                setPrice(game.price || 0);
                setInvitedPlayers(game.playersInvited || []);
                setGroupId(game.groupId || group?.id || '');
            } else {
                setDate('');
                setTime('');
                setLocation('');
                setLocationUrl('');
                setMaxPlayers(12);
                setMinPlayers(10);
                setSubTime(5);
                setRecurrence('none');
                setPrice(0);
                setInvitedPlayers(group?.players || []);
                setGroupId(group?.id || '');
            }
        }
    }, [isOpen, group, game, isEditMode]);

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        console.log('[GameModal] handleSubmit called, isEditMode:', isEditMode, 'groupId:', groupId);
        const gameData = {
            status: isEditMode ? game.status : 'open',
            date,
            time,
            location,
            locationUrl: locationUrl || null,
            maxPlayers,
            minPlayers,
            playersInvited: invitedPlayers,
            playersIn: isEditMode ? game.playersIn : [],
            playersOut: isEditMode ? game.playersOut : [],
            teamA: isEditMode ? game.teamA : [],
            teamB: isEditMode ? game.teamB : [],
            subTime,
            recurrence,
            price: Number(price) || 0,
            payments: isEditMode ? game.payments || {} : {},
            groupId
        };

        if (isEditMode) {
            await updateGame(game.id, gameData);
        } else {
            gameData.adminId = user?.uid || null;
            gameData._senderName = playerData?.firstName || 'Someone';
            gameData._groupName = group?.name || '';
            await createGame(gameData);
        }
        console.log('[GameModal] handleSubmit DONE');

        setSubmitting(false);
        setIsOpen(false);
    };

    const handleCancelGame = async () => {
        if (!game) return;
        const gameGroupId = game.groupId || group?.id;
        const allPlayers = [...(game.playersIn || []), ...(game.playersOut || []), ...(game.playersInvited || [])];
        await deleteGame(game.id, {
            groupId: gameGroupId,
            groupName: group?.name || '',
            gameDate: game.date || '',
            senderName: playerData?.firstName || 'Someone',
            senderId: user?.uid,
            allPlayers,
        });
        setIsOpen(false);
        if (gameGroupId) {
            navigate(`/groups/${gameGroupId}`);
        }
    };

    return ReactDOM.createPortal(
        <div className={`modal ${isOpen ? 'is-active' : ''}`} style={{ zIndex: 100 }}>
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div className="modal-card p-2">
                <header className="modal-card-head" style={{ minHeight: "50px", background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <p className="modal-card-title" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{isEditMode ? t('gameSettings') : t('createGame')}</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}></button>
                </header>
                <section className="modal-card-body" style={{ padding: '20px' }}>
                    {/* Date & Time */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('when')}</label>
                    <div className="field" style={{ display: "flex", gap: "10px", marginBottom: '16px' }}>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ borderRadius: '8px' }} />
                        </div>
                    </div>

                    {/* Location */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('location')}</label>
                    <div className="field" style={{ marginBottom: '8px' }}>
                        <div className="control">
                            <input className="input" type="text" placeholder="e.g. Urban Soccer, Field 3" value={location} onChange={(e) => setLocation(e.target.value)} style={{ borderRadius: '8px' }} />
                        </div>
                    </div>
                    <div className="field" style={{ marginBottom: '16px' }}>
                        <div className="control">
                            <input className="input" type="url" placeholder="Google Maps link (optional)" value={locationUrl} onChange={(e) => setLocationUrl(e.target.value)} style={{ borderRadius: '8px', fontSize: '0.85rem' }} />
                        </div>
                    </div>

                    {/* Player Count */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('playersLabel')}</label>
                    <div className="field" style={{ display: "flex", gap: "10px", alignItems: 'center', marginBottom: '16px' }}>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input has-text-centered" type="number" min="1" value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} placeholder="min" style={{ borderRadius: '8px' }} />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>to</span>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input has-text-centered" type="number" min="1" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} placeholder="max" style={{ borderRadius: '8px' }} />
                        </div>
                    </div>

                    {/* Sub Time & Price */}
                    <div className="field" style={{ display: "flex", gap: "10px", alignItems: 'flex-end', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('subTimer')}</label>
                            <div className="control">
                                <input className="input has-text-centered" type="number" min="1" value={subTime} onChange={(e) => setSubTime(e.target.value)} style={{ borderRadius: '8px' }} />
                            </div>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('priceLabel')}</label>
                            <div className="control">
                                <input className="input has-text-centered" type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} style={{ borderRadius: '8px' }} />
                            </div>
                        </div>
                    </div>

                    {/* Recurrence */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('repeat')}</label>
                    <div className="field">
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['none', 'weekly', 'monthly'].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    className="button"
                                    style={{
                                        flex: 1,
                                        borderRadius: '8px',
                                        fontWeight: recurrence === opt ? 'bold' : 'normal',
                                        background: recurrence === opt ? '#5b7bb3' : '#f0f2f5',
                                        color: recurrence === opt ? '#fff' : '#64748b',
                                        border: 'none',
                                        textTransform: 'capitalize',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => setRecurrence(opt)}
                                >
                                    {opt === 'none' ? t('none') : opt === 'weekly' ? t('weekly') : t('monthly')}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot" style={{ minHeight: "50px", display: "flex", gap: "10px", background: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 20px' }}>
                    {isEditMode && (
                        <button
                            className="button"
                            style={{ flex: 1, borderRadius: '8px', fontWeight: 'bold', background: '#e07070', color: '#fff', border: 'none', cursor: 'pointer' }}
                            onClick={handleCancelGame}
                            disabled={loading}
                        >
                            {t('cancelGame')}
                        </button>
                    )}
                    <button
                        className="button"
                        style={{ flex: 1, background: "#5b7bb3", color: "#fff", borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', cursor: 'pointer' }}
                        onClick={handleSubmit}
                        disabled={loading || submitting}
                    >
                        {(loading || submitting) ? (isEditMode ? t('updating') : t('creating')) : (isEditMode ? t('updateGame') : t('createGame'))}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
}

export default GameModal;
