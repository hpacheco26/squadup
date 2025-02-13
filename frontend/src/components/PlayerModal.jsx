import React, { useState, useEffect } from 'react';

function PlayerModal({ isOpen, setIsOpen, onAddPlayer }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [rank] = useState(0); // Rank is always 0, so no need for a state setter

    useEffect(() => {
        if (isOpen) {
            // Reset the form when modal is opened
            setFirstName('');
            setLastName('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        // Handle player addition
        const newPlayer = {
            id: firstName + "." + lastName,
            firstName,
            lastName,
            rank,
            stats: {
                wins: 0,
                draws: 0,
                losses: 0
            },
            userId: null
        };

        // Call the onAddPlayer function passed from the parent component
        onAddPlayer(newPlayer);

        // Close the modal
        setIsOpen(false);
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Add Player</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)}></button>
                </header>
                <section className="modal-card-body">
                    <div className="field">
                        <label className="label">First Name</label>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label className="label">Last Name</label>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>
                    
                </section>
                <footer className="modal-card-foot">
                    <button className="button is-success" onClick={handleSubmit}>
                        Add Player
                    </button>
                    <button className="button" onClick={() => setIsOpen(false)}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default PlayerModal;
