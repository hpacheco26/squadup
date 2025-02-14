import React, { useState, useEffect } from 'react';
import { Button, Columns, Card } from 'react-bulma-components';
import { useNavigate } from 'react-router-dom';

const GamePage = () => {
    const navigate = useNavigate();
    const [timer, setTimer] = useState(60);  // Default to 60 seconds
    const [subTime, setSubTime] = useState(5); // Default substitution time (in seconds)
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [team1, setTeam1] = useState([
        { id: 1, name: "Player 1" },
        { id: 2, name: "Player 2" },
        { id: 3, name: "Player 3" },
    ]);
    const [team2, setTeam2] = useState([
        { id: 4, name: "Player 4" },
        { id: 5, name: "Player 5" },
        { id: 6, name: "Player 6" },
    ]);

    // Timer logic (countdown)
    useEffect(() => {
        let interval;
        if (isGameStarted && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval); // Cleanup interval
    }, [isGameStarted, timer]);

    const startGame = () => {
        setIsGameStarted(true);
        setTimer(60); // Reset timer when game starts
    };

    const handleSubstitution = () => {
        setSubTime(5);  // Reset or update substitution time here if needed
    };

    const resetGame = () => {
        setIsGameStarted(false);
        setTimer(60);  // Reset the timer
        setSubTime(5); // Reset substitution time
    };

    return (
        <div className="container p-6">
            <section className="section">
                <div className="columns is-multiline">
                    {/* Team 1 */}
                    <Columns.Column size={6}>
                        <Card>
                            <Card.Content>
                                <h2 className="title is-4">Team 1</h2>
                                <ul>
                                    {team1.map(player => (
                                        <li key={player.id}>{player.name}</li>
                                    ))}
                                </ul>
                            </Card.Content>
                        </Card>
                    </Columns.Column>

                    {/* Team 2 */}
                    <Columns.Column size={6}>
                        <Card>
                            <Card.Content>
                                <h2 className="title is-4">Team 2</h2>
                                <ul>
                                    {team2.map(player => (
                                        <li key={player.id}>{player.name}</li>
                                    ))}
                                </ul>
                            </Card.Content>
                        </Card>
                    </Columns.Column>
                </div>

                {/* Timer and Start Button */}
                <div className="columns is-centered">
                    <Columns.Column size={4} className="has-text-centered">
                        <Card>
                            <Card.Content>
                                <h2 className="title is-3">Game Timer</h2>
                                <p className="subtitle is-5">
                                    {isGameStarted ? `${timer} seconds` : 'Not started yet'}
                                </p>
                                <Button className="is-primary" onClick={startGame} disabled={isGameStarted}>
                                    Start Game
                                </Button>
                                <Button className="is-warning" onClick={resetGame} style={{ marginLeft: '10px' }}>
                                    Reset Game
                                </Button>
                            </Card.Content>
                        </Card>
                    </Columns.Column>
                </div>

                {/* Substitution Time */}
                <div className="columns is-centered">
                    <Columns.Column size={4} className="has-text-centered">
                        <Card>
                            <Card.Content>
                                <h2 className="title is-4">Substitution Time</h2>
                                <p className="subtitle is-5">{subTime} seconds remaining</p>
                                <Button className="is-info" onClick={handleSubstitution}>
                                    Set Substitution Time
                                </Button>
                            </Card.Content>
                        </Card>
                    </Columns.Column>
                </div>
            </section>
        </div>
    );
};

export default GamePage;
