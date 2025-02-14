import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Columns, Card } from 'react-bulma-components';
import PlayersContainer from '../components/PlayersContainer';
import { useNavigate } from 'react-router-dom';

const PreGamePage = ({ onGoingChange, onInvitedChange, onNotGoingChange }) => {
    const { gameId } = useParams();  // Get the gameId from the URL
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [players, setPlayers] = useState([]);
    const [going, setGoing] = useState([]);
    const [notGoing, setNotGoing] = useState([]);
    const [invited, setInvited] = useState([]);

    useEffect(() => {
        // Fetch the game data and players based on gameId
        const fetchGameData = async () => {
            try {
                const gameResponse = await fetch(`/api/games/${gameId}`);
                const gameData = await gameResponse.json();
                setGame(gameData);

                const playersResponse = await fetch(`/api/players/${gameId}`);
                const playersData = await playersResponse.json();
                setPlayers(playersData);
                setGoing(gameData.goingPlayers || []);
                setNotGoing(gameData.notGoingPlayers || []);
                setInvited(gameData.invitedPlayers || []);
            } catch (error) {
                console.error("Error fetching game data:", error);
            }
        };

        fetchGameData();
    }, [gameId]);

    if (!game) return <div>Loading...</div>;

    const handleGameOn = (playerId) => {
        const updatedInvited = invited.filter(player => player.id !== playerId);
        const updatedGoing = [...going, players.find(player => player.id === playerId)];

        setGoing(updatedGoing);
        setInvited(updatedInvited);
        onGoingChange(updatedGoing);
        onInvitedChange(updatedInvited);
    };

    const handleOut = (playerId) => {
        const updatedInvited = invited.filter(player => player.id !== playerId);
        const updatedNotGoing = [...notGoing, players.find(player => player.id === playerId)];

        setNotGoing(updatedNotGoing);
        setInvited(updatedInvited);
        onNotGoingChange(updatedNotGoing);
        onInvitedChange(updatedInvited);
    };

    const handleStartGame = () => {
        navigate('/game-page'); // Make sure this route exists and works
    };

    return (
        <div className="container p-6">
            <section className="section">
                {/* Game details */}
                <Card className="game-card mb-6">
                    <Card.Content>
                        <h1 className="title is-3">{game.name}</h1>
                        <p><strong>Location:</strong> {game.location}</p>
                        <p><strong>Date:</strong> {game.date}</p>
                        <p><strong>Time:</strong> {game.time}</p>
                    </Card.Content>
                </Card>

                {/* Players Columns */}
                <Columns className="is-multiline">
                    {/* Going players */}
                    <Columns.Column size={4}>
                        <h2 className="title is-4 mb-3">Going</h2>
                        <PlayersContainer 
                            players={going} 
                            onGameOn={handleGameOn} 
                            actionLabel="Game On"
                        />
                    </Columns.Column>

                    {/* Not Going players */}
                    <Columns.Column size={4}>
                        <h2 className="title is-4 mb-3">Not Going</h2>
                        <PlayersContainer 
                            players={notGoing} 
                            onOut={handleOut} 
                            actionLabel="Out"
                        />
                    </Columns.Column>

                    {/* Invited players */}
                    <Columns.Column size={4}>
                        <h2 className="title is-4 mb-3">Invited</h2>
                        <PlayersContainer 
                            players={invited} 
                            onGameOn={handleGameOn} 
                            onOut={handleOut}
                            actionLabel="Game On"
                            additionalActionLabel="Out"
                        />
                    </Columns.Column>
                </Columns>
            </section>

            {/* Fixed bottom Start Game Button */}
            <div className="fixed-bottom">
                <Button className="is-primary is-fullwidth" onClick={handleStartGame}>
                    Start Game
                </Button>
            </div>
        </div>
    );
};

export default PreGamePage;
