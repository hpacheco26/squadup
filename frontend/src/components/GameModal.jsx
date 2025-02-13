import React, { useState, useEffect } from 'react';

function GameModal({ isOpen, setIsOpen, onCreateGame, group }) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [minPlayers, setMinPlayers] = useState(5);
    const [subTime, setSubTime] = useState(5); // Substitution time in minutes
    const [invitedPlayers, setInvitedPlayers] = useState(group?.players || []); // Default to group players

    useEffect(() => {
        if (isOpen) {
            // Reset the form when modal is opened
            setDate('');
            setTime('');
            setLocation('');
            setMaxPlayers(10);
            setMinPlayers(5);
            setSubTime(5);
            setInvitedPlayers(group?.players || []);
        }
    }, [isOpen, group]);

    const handleSubmit = () => {
        // Handle game creation
        const newGame = {
            id: `${date}_${time}`,
            date,
            time,
            location,
            maxPlayers,
            minPlayers,
            invitedPlayers,
            playersGoing: [],
            playersNotGoing: [],
            subTime
        };

        // Call the onCreateGame function passed from the parent component
        onCreateGame(newGame);

        // Close the modal
        setIsOpen(false);
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Create Game</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)}></button>
                </header>
                <section className="modal-card-body">
                    <div className="field">
                        <label className="label">Date</label>
                        <div className="control">
                            <input
                                className="input"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Time</label>
                        <div className="control">
                            <input
                                className="input"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Location</label>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Max Players</label>
                        <div className="control">
                            <input
                                className="input"
                                type="number"
                                min="1"
                                value={maxPlayers}
                                onChange={(e) => setMaxPlayers(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Min Players</label>
                        <div className="control">
                            <input
                                className="input"
                                type="number"
                                min="1"
                                value={minPlayers}
                                onChange={(e) => setMinPlayers(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Substitution Time (Minutes)</label>
                        <div className="control">
                            <input
                                className="input"
                                type="number"
                                min="1"
                                value={subTime}
                                onChange={(e) => setSubTime(e.target.value)}
                            />
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot is-flex is-justify-content-space-around">
                    <button className="button is-success is-fullwidth" style={{ maxWidth: '30%' }} onClick={handleSubmit}>
                        Create Game
                    </button>
                    <button className="button is-light is-fullwidth" style={{ maxWidth: '30%' }} onClick={() => setIsOpen(false)}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default GameModal;
