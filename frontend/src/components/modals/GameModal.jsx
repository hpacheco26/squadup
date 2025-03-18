import React, { useState, useEffect } from 'react';
import useGameStore from '../../store/gameStore';

function GameModal({ isOpen, setIsOpen, group }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [minPlayers, setMinPlayers] = useState(5);
    const [subTime, setSubTime] = useState(5);
    const [invitedPlayers, setInvitedPlayers] = useState(group?.players || []);
    const [groupId, setGroupId] = useState('');

    const { createGame, loading } = useGameStore(); // Zustand store for game actions

    useEffect(() => {
        if (isOpen) {
            setDate('');
            setTime('');
            setLocation('');
            setMaxPlayers(12);
            setMinPlayers(10);
            setSubTime(5);
            setInvitedPlayers(group?.players || []);
            setGroupId(group?.id || '');
        }
    }, [isOpen, group]);

    const handleSubmit = async () => {
        const newGame = {
            status: 'open',
            date,
            time,
            location,
            maxPlayers,
            minPlayers,
            invitedPlayers,
            playersGoing: [],
            playersNotGoing: [],
            subTime,
            groupId
        };

        await createGame(newGame); // Store handles game creation

        setIsOpen(false);
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`} >
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div className="modal-card p-2">
                <header className="modal-card-head" style={{height:"50px"}}>
                    <p className="modal-card-title">Create Game</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)}></button>
                </header>
                <section className="modal-card-body">
                    <div className="field" style={{ display:"flex", gap:"10px" }}>
                        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                    </div>
                    {/* <div className="field">
                        <label className="label">Date</label>
                        <div className="control">
                            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Time</label>
                        <div className="control">
                            <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                    </div> */}
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
                <footer className="modal-card-foot is-flex is-justify-content-space-around" style={{height:"50px"}}>
                    <button className="button is-fullwidth" style={{ maxWidth: '100%',background:"#badfe1" }} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Creating...' : 'Create Game'}
                    </button>
                   
                </footer>
            </div>
        </div>
    );
}

export default GameModal;
