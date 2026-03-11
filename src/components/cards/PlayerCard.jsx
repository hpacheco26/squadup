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
        const nameParts = editedName.trim().split(' ');
        const newFirstName = nameParts[0] || '';
        const newLastName = nameParts.slice(1).join(' ') || '';
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
                                <button  onClick={handleEditClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', fontSize: '15px', color: '#6b7280', marginLeft: '8px' }}>
                                    <FaEdit />
                                </button>
                            )}
                        </h2>
                        <button onClick={toggleCollapse} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', color: '#6b7280' }}>
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


                            <div className='' style={{ position: "relative", padding: "20px" }}>
                                {/* Background Rank Icon */}
                                {/* <div 
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        right: "10px",
                                        transform: "translateY(-50%)",
                                        opacity: 0.2, // Adjust opacity for better readability
                                        zIndex: 0,
                                    }}
                                >
                                    <RankIcon rank={rank} size={150} />
                                </div> */}

                                {/* Foreground Stats */}
                                <div style={{ position: "relative", zIndex: 1 }}>
                                    <p>Wins: {stats.wins}</p>
                                    <p>Draws: {stats.draws}</p>
                                    <p>Losses: {stats.losses}</p>
                                </div>
                            </div>

                            <button className="button" style={{ background: '#e07070', color: '#fff', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', padding: '8px 16px', zIndex: 1, position: 'relative' }} onClick={handleRemove}>
                                Remove Player
                            </button>

                             {/* Background Rank Icon */}
                             <div 
                                style={{
                                    position: "absolute",
                                    top: "75%",
                                    right: "10px",
                                    transform: "translateY(-70%)",
                                    opacity: 0.5, 
                                    zIndex: 0,
                                }}
                            >
                                <RankIcon rank={rank} size={140} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PlayerCard;
