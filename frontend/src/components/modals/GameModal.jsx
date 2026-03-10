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
                setInvitedPlayers(game.playersInvited || []);
                setGroupId(game.groupId || group?.id || '');
            } else {
                setDate('');
                setTime('');
                setLocation('');
                setMaxPlayers(12);
                setMinPlayers(10);
                setSubTime(5);
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
                <header className="modal-card-head" style={{minHeight:"50px"}}>
                    <p className="modal-card-title">{isEditMode ? 'Game Settings' : 'Create Game'}</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)}></button>
                </header>
                <section className="modal-card-body">
                    <div className="field" style={{ display:"flex", gap:"10px" }}>
                        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                    <div className="field">
                        <label className="label">Location</label>
                        <div className="control">
                            <input className="input" type="text" placeholder="Enter location" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                    </div>

                    <label className="label">Players</label>
                    <div className="field"  style={{ display:"flex", gap:"10px" }}>
                        <input className="input" type="number" min="1" value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} placeholder='min'/>
                        <div style={{alignSelf: "center"}}>to</div>
                        <input className="input" type="number" min="1" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} placeholder='max' />
                    </div>
                    <div className="field" >
                        <label className="label">Sub Time</label>
                        <input className="input" type="number" min="1" value={subTime} onChange={(e) => setSubTime(e.target.value)} />
                    </div>
                </section>
                <footer className="modal-card-foot" style={{ minHeight: "50px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button className="button is-fullwidth" style={{ maxWidth: '100%', background: "#5b7bb3", color: "#fff" }} onClick={handleSubmit} disabled={loading}>
                        {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Game' : 'Create Game')}
                    </button>
                    {isEditMode && (
                        <button className="button is-fullwidth is-danger is-outlined" style={{ maxWidth: '100%' }} onClick={handleCancelGame} disabled={loading}>
                            Cancel Game
                        </button>
                    )}
                </footer>
            </div>
        </div>,
        document.body
    );
}

export default GameModal;
