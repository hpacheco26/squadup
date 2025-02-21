import React, { useState } from 'react';
import { Modal, Button, Card } from 'react-bulma-components';
import useGroupStore from '../store/groupStore'; // Import groupStore
import { useNavigate } from 'react-router-dom';
import useHoverEffect from '../hooks/useHoverEffect'; // Import the custom hook

const EndGame = ({ team1, team2 }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { updateRank, group } = useGroupStore(); // Access updateRank function
    const navigate = useNavigate();

    const { handleMouseEnter, handleMouseLeave, getStyle } = useHoverEffect();

    const handleSelectWinner = (winner, looser) => {
        updateRank(group.id, winner, looser); // Call updateRank with the selected team
        setIsModalOpen(false); // Close modal after selection
        navigate('/rank');
    };

    return (
        <>
            {/* End Game Button */}
            <div className="card" onClick={() => setIsModalOpen(true)}>
                <div className="card-content">
                    <h2 className="title is-4">End Game</h2>
                </div>
            </div>

            {/* End Game Modal */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} closeOnEsc closeOnBlur>
                <Modal.Card>
                    <Modal.Card.Header>
                        <Modal.Card.Title className="has-text-centered">Select the Winning Team</Modal.Card.Title>
                    </Modal.Card.Header>
                    <Modal.Card.Body className="has-text-centered">
                        <div className="columns is-centered">
                            {/* Team 1 Card */}
                            <div className="column is-half">
                                <Card
                                    onClick={() => handleSelectWinner(team1, team2)}
                                    className="clickable-card"
                                    onMouseEnter={() => handleMouseEnter('team1')} // Handle hover enter for team 1
                                    onMouseLeave={handleMouseLeave} // Handle hover leave
                                    style={getStyle('team1')} // Apply hover style
                                >
                                    <Card.Content className="has-text-centered">
                                        <h2 className="title is-4">Team 1</h2>
                                    </Card.Content>
                                </Card>
                            </div>

                            {/* Team 2 Card */}
                            <div className="column is-half">
                                <Card
                                    onClick={() => handleSelectWinner(team2, team1)}
                                    className="clickable-card"
                                    onMouseEnter={() => handleMouseEnter('team2')} // Handle hover enter for team 2
                                    onMouseLeave={handleMouseLeave} // Handle hover leave
                                    style={getStyle('team2')} // Apply hover style
                                >
                                    <Card.Content className="has-text-centered">
                                        <h2 className="title is-4">Team 2</h2>
                                    </Card.Content>
                                </Card>
                            </div>
                        </div>
                    </Modal.Card.Body>
                    <Modal.Card.Footer className="has-text-centered">
                        <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    </Modal.Card.Footer>
                </Modal.Card>
            </Modal>
        </>
    );
};

export default EndGame;
