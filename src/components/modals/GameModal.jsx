import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../../store/gameStore';

function GameModal({ isOpen, setIsOpen, group, game }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [minPlayers, setMinPlayers] = useState(5);
    const [subTime, setSubTime] = useState(5);
    const [recurrence, setRecurrence] = useState('none');
    const [price, setPrice] = useState(0);
    const [invitedPlayers, setInvitedPlayers] = useState(group?.players || []);
    const [groupId, setGroupId] = useState('');

    const { createGame, updateGame, deleteGame, loading } = useGameStore();
    const navigate = useNavigate();

    const isEditMode = !!game;

    useEffect(() => {
        if (isOpen) {
            if (isEditMode) {
                setDate(game.date || '');
                setTime(game.time || '');
                setLocation(game.location || '');
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
        const gameData = {
            status: isEditMode ? game.status : 'open',
            date,
            time,
            location,
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
            await createGame(gameData);
        }

        setIsOpen(false);
    };

    const handleCancelGame = async () => {
        if (!game) return;
        const gameGroupId = game.groupId || group?.id;
        await deleteGame(game.id);
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
                    <p className="modal-card-title" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{isEditMode ? 'Game Settings' : 'Create Game'}</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}></button>
                </header>
                <section className="modal-card-body" style={{ padding: '20px' }}>
                    {/* Date & Time */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>When</label>
                    <div className="field" style={{ display: "flex", gap: "10px", marginBottom: '16px' }}>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ borderRadius: '8px' }} />
                        </div>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ borderRadius: '8px' }} />
                        </div>
                    </div>

                    {/* Location */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</label>
                    <div className="field" style={{ marginBottom: '16px' }}>
                        <div className="control">
                            <input className="input" type="text" placeholder="e.g. Urban Soccer, Field 3" value={location} onChange={(e) => setLocation(e.target.value)} style={{ borderRadius: '8px' }} />
                        </div>
                    </div>

                    {/* Player Count */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Players</label>
                    <div className="field" style={{ display: "flex", gap: "10px", alignItems: 'center', marginBottom: '16px' }}>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input has-text-centered" type="number" min="1" value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} placeholder="min" style={{ borderRadius: '8px' }} />
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>to</span>
                        <div className="control" style={{ flex: 1 }}>
                            <input className="input has-text-centered" type="number" min="1" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} placeholder="max" style={{ borderRadius: '8px' }} />
                        </div>
                    </div>

                    {/* Sub Time */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sub Timer (minutes)</label>
                    <div className="field" style={{ marginBottom: '16px' }}>
                        <div className="control">
                            <input className="input has-text-centered" type="number" min="1" value={subTime} onChange={(e) => setSubTime(e.target.value)} style={{ borderRadius: '8px', maxWidth: '120px' }} />
                        </div>
                    </div>

                    {/* Game Price */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price (€)</label>
                    <div className="field" style={{ marginBottom: '16px' }}>
                        <div className="control">
                            <input className="input has-text-centered" type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} style={{ borderRadius: '8px', maxWidth: '120px' }} />
                        </div>
                    </div>

                    {/* Recurrence */}
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Repeat</label>
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
                                    {opt === 'none' ? 'None' : opt}
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
                            Cancel Game
                        </button>
                    )}
                    <button
                        className="button"
                        style={{ flex: 1, background: "#5b7bb3", color: "#fff", borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', cursor: 'pointer' }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Game' : 'Create Game')}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
}

export default GameModal;
