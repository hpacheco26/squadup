import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaEdit } from 'react-icons/fa';
import RankIcon from '../RankIcon';

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
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleNameBlur();
        }
    };

    return (
        <div className={`${cardClass} player-card`} style={{ transition: 'all 0.3s ease'}}>
            <div className="card-content" style={{ padding: '10px'}}>
                <div className="is-flex is-justify-content-space-between"  >
                {!isEditing ? (
                    <>
                        <h2 className="subtitle is-5" style={{ margin: '0px'}}>
                            {editedName}
                            {!isCollapsed && (
                                <button  onClick={handleEditClick} className="ml-2" style={{fontSize:"15px", color:"gray"}}>
                                    <FaEdit />
                                </button>
                            )}
                        </h2>
                        <button className='mr-2' onClick={toggleCollapse}>
                            {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                        </button>
                    </>
                ) : null }
                    
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
                                    className="input subttitle is-4"
                                    value={editedName} 
                                    onChange={handleNameChange} 
                                    onBlur={handleNameBlur} 
                                    onKeyPress={handleKeyPress}
                                    autoFocus
                                />
                            ) : null}
                            <div className='mt-4' style={{display: "flex", justifyContent:"space-between"}}>
                                <div className="content">
                                    <p>Wins: {stats.wins}</p>
                                    <p>Draws: {stats.draws}</p>
                                    <p>Losses: {stats.losses}</p>
                                </div>
                                <div className="mr-4">
                                    <RankIcon rank={rank} size={90} />
                                </div>
                            </div>
                            <footer className="card-footer">
                                <button className="card-footer-item button" style={{background:"#F4A6A0"}} onClick={handleRemove}>
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
