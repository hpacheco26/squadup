import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit } from 'react-icons/fa';

function PlayerCard({ player, onRemovePlayer, onUpdatePlayer }) {
    const { id, firstName, lastName, rank, stats, userId } = player;
    const cardClass = userId ? 'card' : 'card has-background-grey-lighter'; // Apply grey background if no user ID

    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(`${firstName} ${lastName}`);
    const [isCollapsed, setIsCollapsed] = useState(true); // Default collapsed

    const handleRemove = () => {
        if (onRemovePlayer) {
            onRemovePlayer(id);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleNameChange = (event) => {
        setEditedName(event.target.value);
    };

    const handleNameBlur = () => {
        setIsEditing(false);
        const [newFirstName, newLastName] = editedName.split(' ');
        if (onUpdatePlayer) {
            onUpdatePlayer(id, newFirstName, newLastName);
        }
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
        if (isCollapsed) {
            setIsEditing(false);
        }
    };

    return (
        <div className={`${cardClass} player-card`} style={{ transition: 'all 0.3s ease' }}>
            <div className="card-content">
                <div className="is-flex is-justify-content-space-between">
                    <h2 className="title is-4">
                        {editedName}
                        {!isCollapsed && (
                            <button className="button is-small is-light" onClick={handleEditClick}>
                                <FaEdit />
                            </button>
                        )}
                    </h2>
                    <button className="button is-small is-light" onClick={toggleCollapse}>
                        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                    </button>
                </div>
                <div style={{
                    maxHeight: isCollapsed ? '0px' : '500px',  
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
                    opacity: isCollapsed ? 0 : 1
                }}>
                    {!isCollapsed && (
                        <>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    className="input title is-4"
                                    value={editedName} 
                                    onChange={handleNameChange} 
                                    onBlur={handleNameBlur} 
                                    autoFocus
                                />
                            ) : null}
                            <p className="subtitle is-6">Rank: {rank}</p>
                            <div className="content">
                                <p>Wins: {stats.wins}</p>
                                <p>Draws: {stats.draws}</p>
                                <p>Losses: {stats.losses}</p>
                            </div>
                            <footer className="card-footer">
                                <button className="card-footer-item button is-danger" onClick={handleRemove}>
                                    Remove Player
                                </button>
                            </footer>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlayerCard;
