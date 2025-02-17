import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Columns, Card } from 'react-bulma-components';
import PlayersList from '../components/PlayersList';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';

const PreGamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { game, fetchGameById, updateGame } = useGameStore();
    const [going, setGoing] = useState([]);
    const [notGoing, setNotGoing] = useState([]);
    const [invited, setInvited] = useState([]);

    useEffect(() => {
        const fetchGameData = async () => {
            await fetchGameById(gameId);
        };
        fetchGameData();
    }, [gameId, fetchGameById]);

    useEffect(() => {
        if (game) {
            setGoing(game.goingPlayers || []);
            setNotGoing(game.notGoingPlayers || []);
            setInvited(game.invitedPlayers || []);
        }
    }, [game]);

    const handleGameOn = async (playerId) => {
        if (notGoing.some(player => player.id === playerId)) {
            const updatedNotGoing = notGoing.filter(player => player.id !== playerId);
            const updatedGoing = [...going, notGoing.find(player => player.id === playerId)];
            setNotGoing(updatedNotGoing);
            setGoing(updatedGoing);
            await updateGame(gameId, { goingPlayers: updatedGoing, notGoingPlayers: updatedNotGoing });
        } else if (invited.some(player => player.id === playerId)) {
            const updatedInvited = invited.filter(player => player.id !== playerId);
            const updatedGoing = [...going, invited.find(player => player.id === playerId)];
            setInvited(updatedInvited);
            setGoing(updatedGoing);
            await updateGame(gameId, { goingPlayers: updatedGoing, invitedPlayers: updatedInvited });
        }
    };

    const handleOut = async (playerId) => {
        if (going.some(player => player.id === playerId) || invited.some(player => player.id === playerId)) {
            const updatedGoing = going.filter(player => player.id !== playerId);
            const updatedInvited = invited.filter(player => player.id !== playerId);
            const updatedNotGoing = [...notGoing, ...going.filter(player => player.id === playerId), ...invited.filter(player => player.id === playerId)];
            setGoing(updatedGoing);
            setInvited(updatedInvited);
            setNotGoing(updatedNotGoing);
            await updateGame(gameId, { goingPlayers: updatedGoing, invitedPlayers: updatedInvited, notGoingPlayers: updatedNotGoing });
        }
    };

    const handleStartGame = () => {
        navigate('/gamePage');
    };

    if (!game) return <div>Loading...</div>;

    return (
        <div className="container p-6">
            <section className="section">
                <Card className="game-card mb-6">
                    <Card.Content>
                        <h1 className="title is-3">{game.name}</h1>
                        <p><strong>Location:</strong> {game.location}</p>
                        <p><strong>Date:</strong> {game.date}</p>
                        <p><strong>Time:</strong> {game.time}</p>
                    </Card.Content>
                </Card>

                <Columns className="is-multiline">
                    <Columns.Column size={4}>
                        <h2 className="title is-4 mb-3">Going</h2>
                        <PlayersList players={going} onOut={handleOut} actionLabel="Game On" additionalActionLabel="Out" />
                    </Columns.Column>

                    <Columns.Column size={4}>
                        <h2 className="title is-4 mb-3">Not Going</h2>
                        <PlayersList players={notGoing} onGameOn={handleGameOn} actionLabel="Game On" additionalActionLabel="Out" />
                    </Columns.Column>

                    <Columns.Column size={4}>
                        <h2 className="title is-4 mb-3">Invited</h2>
                        <PlayersList players={invited} onGameOn={handleGameOn} onOut={handleOut} actionLabel="Game On" additionalActionLabel="Out" />
                    </Columns.Column>
                </Columns>
            </section>

            <div className="fixed-bottom">
                <Button className="is-primary is-fullwidth" onClick={handleStartGame}>
                    Start Game
                </Button>
            </div>
        </div>
    );
};

export default PreGamePage;
