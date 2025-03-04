import React, { useState, useEffect } from 'react';
import PlayersContainer from '../containers/PlayersContainer'; // Import PlayersContainer

function GroupSettingsModal({ isOpen, setIsOpen, group, updateGroup, deleteGroup, navigate }) {
    const [groupName, setGroupName] = useState('');

    useEffect(() => {
        if (isOpen && group?.name) {
            setGroupName(group.name);
        }
    }, [isOpen, group]);

    const handleUpdateGroup = () => {
        if (groupName.trim()) {
            updateGroup(group.id, { ...group, name: groupName });
            setIsOpen(false);
        }
    };

    const handleDeleteGroup = () => {
        deleteGroup(group.id);
        navigate('/groups');
    };

    return (
        <div className={`modal ${isOpen ? 'is-active' : ''}`}>
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">Group Settings</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)}></button>
                </header>
                
                {/* Modal Body */}
                <section className="modal-card-body">
                    {/* Group Name Input */}
                    <div className="field">
                        <label className="label">Group Name</label>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="Enter group name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Players List (With scroll inside PlayersContainer) */}
                    <PlayersContainer />
                </section>

                {/* Centered & Evenly Spaced Footer Buttons */}
                <footer className="modal-card-foot is-flex is-justify-content-space-around">
                    <button className="button is-danger is-fullwidth" style={{ maxWidth: '30%' }} onClick={handleDeleteGroup}>
                        Delete Group
                    </button>
                    <button className="button is-success is-fullwidth" style={{ maxWidth: '30%' }} onClick={handleUpdateGroup}>
                        Save
                    </button>
                    <button className="button is-fullwidth" style={{ maxWidth: '30%' }} onClick={() => setIsOpen(false)}>
                        Cancel
                    </button>
                </footer>
            </div>
        </div>
    );
}

export default GroupSettingsModal;
