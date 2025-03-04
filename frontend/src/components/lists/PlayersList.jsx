import React from 'react';
import { Button, Card } from 'react-bulma-components';

const PlayersList = ({ players, onGameOn, onOut, actionLabel, additionalActionLabel, user, isAdmin }) => {
    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {players.length === 0 ? (
                <p>No players in this category.</p>
            ) : (
                players.map(player => (
                    <Card key={player.id} className="mb-3 ml-3 mr-3"> {/* Added left and right margin */}
                        <Card.Content>
                            <h3 className="title is-5">{player.firstName} {player.lastName}</h3>
                            {(isAdmin || player.userId === user.uid) && (
                                <div className="buttons">
                                    {onGameOn && (
                                        <Button color="primary" onClick={() => onGameOn(player.id)}>{actionLabel}</Button>
                                    )}
                                    {onOut && (
                                        <Button color="danger" onClick={() => onOut(player.id)}>{additionalActionLabel || 'Out'}</Button>
                                    )}
                                </div>
                            )}
                        </Card.Content>
                    </Card>
                ))
            )}
        </div>
    );
};

export default PlayersList;
