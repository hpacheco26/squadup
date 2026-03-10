import React, { useState, useEffect } from 'react';
import useGroupStore from '../../store/groupStore';

function PlayerModal({ isOpen, setIsOpen, onAddPlayer }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [rank] = useState(0); 
    const { group } = useGroupStore();


    useEffect(() => {
        if (isOpen) {
            // Reset the form when modal is opened
            setFirstName('');
            setLastName('');
        }
    }, [isOpen]);

    const handleSubmit = () => {

        const newPlayer = {
            id: crypto.randomUUID(),
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

        onAddPlayer(newPlayer);

        setIsOpen(false);
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`} style={{ zIndex: 100 }}>
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div className="modal-card p-2">
                <header className="modal-card-head" style={{ minHeight: '50px', background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
                    <p className="modal-card-title" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>New Player</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)}></button>
                </header>
                <section className="modal-card-body" style={{ padding: '20px' }}>
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>First Name</label>
                    <div className="field" style={{ marginBottom: '16px' }}>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Name</label>
                    <div className="field">
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot" style={{ minHeight: '50px', display: 'flex', justifyContent: 'center', background: '#fff', borderTop: '1px solid #e2e8f0', padding: '16px 20px' }}>
                    <button
                        className="button"
                        style={{ flex: 1, background: '#5b7bb3', color: '#fff', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none' }}
                        onClick={handleSubmit}
                    >
                        Add Player
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default PlayerModal;
