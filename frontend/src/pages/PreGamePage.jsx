import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Columns, Card } from 'react-bulma-components';
import PlayersList from '../components/lists/PlayersList';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore'; // Assuming there's an auth store to get user info
import GameHeaderBar from '../components/bars/GameHeaderBar';

const PreGamePage = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const { game, fetchGameById, updateGame, deleteGame } = useGameStore();
    const { group } = useGroupStore();
    const { user } = useAuthStore(); // Get logged-in user info
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
            setGoing(game.playersGoing || []);
            setNotGoing(game.playersNotGoing || []);
            setInvited(game.invitedPlayers || []);
        }
    }, [game]);

    const handleGameOn = async (playerId) => {
        if (notGoing.some(player => player.id === playerId)) {
            const updatedNotGoing = notGoing.filter(player => player.id !== playerId);
            const updatedGoing = [...going, notGoing.find(player => player.id === playerId)];
            setNotGoing(updatedNotGoing);
            setGoing(updatedGoing);
            await updateGame(gameId, { playersGoing: updatedGoing, playersNotGoing: updatedNotGoing });
        } else if (invited.some(player => player.id === playerId)) {
            const updatedInvited = invited.filter(player => player.id !== playerId);
            const updatedGoing = [...going, invited.find(player => player.id === playerId)];
            setInvited(updatedInvited);
            setGoing(updatedGoing);
            await updateGame(gameId, { playersGoing: updatedGoing, invitedPlayers: updatedInvited });
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
            await updateGame(gameId, { playersGoing: updatedGoing, invitedPlayers: updatedInvited, playersNotGoing: updatedNotGoing });
        }
    };

    const handleStartGame = () => {
        navigate(`/game/${game.id}`);
    };

    const handleCancelGame = async () => {
        await deleteGame(gameId);
        navigate(`/groups/${group.id}`);
    };

    if (!game) return <div>Loading...</div>;

    return (
        <>
            <GameHeaderBar gameId={gameId} />
            <div className="container p-2" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <PlayersList 
                        players={going}
                        onOut={handleOut}
                        statusLabel="IN"
                        user={user}
                        isAdmin={game.adminId === user.id}
                    />
                </Columns.Column>

                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <PlayersList
                        players={notGoing}
                        onGameOn={handleGameOn}
                        statusLabel="OUT"
                        user={user}
                        isAdmin={game.adminId === user.id}
                    />
                </Columns.Column>

                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <PlayersList
                        players={invited}
                        onGameOn={handleGameOn}
                        onOut={handleOut}
                        statusLabel="?"
                        user={user}
                        isAdmin={game.adminId === user.id}
                        
                    />
                </Columns.Column>

            </div>
        </>
    );
};

export default PreGamePage;
