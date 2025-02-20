import React, { useState, useEffect } from 'react';
import { Button, Columns, Card } from 'react-bulma-components';
import { useNavigate, useParams } from 'react-router-dom';
import { balanceTeams } from '../utils/teamBalancer';
import useGameStore from '../store/gameStore'; // Import Zustand store
import TeamList from '../components/TeamList'; // Import the TeamList component

const GamePage = () => {
    const navigate = useNavigate();
    const { gameId } = useParams(); // Get game ID from URL params

    const { game, fetchGameById, loading } = useGameStore(); // Zustand store
    const [timer, setTimer] = useState(60);
    const [subTime, setSubTime] = useState(5);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [team1, setTeam1] = useState([]);
    const [team2, setTeam2] = useState([]);

    // Fetch the game data when the component mounts
    useEffect(() => {
        if (gameId) {
            fetchGameById(gameId);
        }
    }, [gameId, fetchGameById]);

    // Balance teams when the game data is loaded
    useEffect(() => {
        if (game?.goingPlayers?.length > 0) {
            const { team1, team2 } = balanceTeams(game.goingPlayers);
            setTeam1(team1);
            setTeam2(team2);
        }
    }, [game]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isGameStarted && timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isGameStarted, timer]);

    const startGame = () => {
        setIsGameStarted(true);
        setTimer(60);
    };

    const handleSubstitution = () => {
        setSubTime(5);
    };

    const resetGame = () => {
        setIsGameStarted(false);
        setTimer(60);
        setSubTime(5);
    };

    if (loading) {
        return <p>Loading game...</p>;
    }

    return (
        <div className="container p-6">
            <section className="section">
                <h1 className="title">{game?.name || 'Game'}</h1>
                <div className="columns is-multiline">
                    {/* Team 1 */}
                    <Columns.Column size={6}>
                        <Card>
                            <Card.Content>
                                <h2 className="title is-4">Team 1</h2>
                                <TeamList team={team1} />  {/* Render Team 1 with statuses */}
                            </Card.Content>
                        </Card>
                    </Columns.Column>

                    {/* Team 2 */}
                    <Columns.Column size={6}>
                        <Card>
                            <Card.Content>
                                <h2 className="title is-4">Team 2</h2>
                                <TeamList team={team2} />  {/* Render Team 2 with statuses */}
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
