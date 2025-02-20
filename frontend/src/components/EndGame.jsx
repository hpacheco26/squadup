import React, { useState } from 'react';
import { Modal, Button, Card } from 'react-bulma-components';
import useGroupStore from '../store/groupStore'; // Import groupStore
import { useNavigate } from 'react-router-dom';

const EndGame = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { updateRank } = useGroupStore(); // Access updateRank function
    const navigate = useNavigate();

    const handleSelectWinner = (team) => {
        updateRank(team); // Call updateRank with the selected team
        setIsModalOpen(false); // Close modal after selection
        
        
    };

    return (
        <>
            {/* End Game Button */}
            <Button color="danger" onClick={() => setIsModalOpen(true)} className="ml-4">
                End Game
            </Button>

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
                                <Card onClick={() => handleSelectWinner('team1')} className="clickable-card">
                                    <Card.Content className="has-text-centered">
                                        <h2 className="title is-4">Team 1</h2>
                                    </Card.Content>
                                </Card>
                            </div>

                            {/* Team 2 Card */}
                            <div className="column is-half">
                                <Card onClick={() => handleSelectWinner('team2')} className="clickable-card">
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
