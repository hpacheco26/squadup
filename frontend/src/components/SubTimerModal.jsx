import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bulma-components';
import { motion } from 'framer-motion';
import PlayerCardMini from './PlayerCardMini';

const SubTimerModal = ({ team1, team2, isOpen, onClose, onAcceptSub }) => {
    const getLowestIndexPlayer = (team) => {
        return team.length > 0 ? team[0] : null;
    };

    const player1 = getLowestIndexPlayer(team1);
    const player2 = getLowestIndexPlayer(team2);

    return (
        <Modal show={isOpen} onClose={onClose} closeOnEsc={false} closeOnBlur={false}>
            <Modal.Card>
                <Modal.Card.Header>
                    <Modal.Card.Title className="has-text-centered is-size-4">Substitution Time!</Modal.Card.Title>
                </Modal.Card.Header>
                <Modal.Card.Body className="has-text-centered">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="columns is-centered is-vcentered"
                    >
                        <div className="column is-half has-text-centered">
                            {player1 && <PlayerCardMini player={player1} status="Sub Out" />}
                        </div>
                        <div className="column is-half has-text-centered">
                            {player2 && <PlayerCardMini player={player2} status="Sub Out" />}
                        </div>
                    </motion.div>
                </Modal.Card.Body>
                <Modal.Card.Footer className="has-text-centered">
                    <Button color="primary" onClick={onAcceptSub}>
                        Accept Sub
                    </Button>
                </Modal.Card.Footer>
            </Modal.Card>
        </Modal>
    );
};

export default SubTimerModal;
