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
    const { game, fetchGameById, handlePlayerOut, handlePlayerIn } = useGameStore();
    const { group } = useGroupStore();
    const { user } = useAuthStore(); // Get logged-in user info
    const [playersIn, setPlayersIn] = useState([]);
    const [playersOut, setPlayersOut] = useState([]);
    const [playersInvited, setPlayersInvited] = useState([]);

    useEffect(() => {
        const fetchGameData = async () => {
            await fetchGameById(gameId);
        };
        fetchGameData();
    }, [gameId, fetchGameById]);

    useEffect(() => {
        if (game) {
            setPlayersIn(game.playersIn || []);
            setPlayersOut(game.playersOut || []);
            setPlayersInvited(game.playersInvited || []);
        }
    }, [game]);

    if (!game) return <div>Loading...</div>;

    return (
        <>
            <GameHeaderBar gameId={gameId} />
            <div className="p-2" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto', gap: '12px' }}>
                <div>
                    <PlayersList 
                        players={playersIn}
                        leftSwipe={handlePlayerOut}
                        statusLabel="IN"
                        user={user}
                        isAdmin={game.adminId === user.uid}
                    />
                </div>

                <div>
                    <PlayersList
                        players={playersOut}
                        rightSwipe={handlePlayerIn}
                        statusLabel="OUT"
                        user={user}
                        isAdmin={game.adminId === user.uid}
                    />
                </div>

                <div>
                    <PlayersList
                        players={playersInvited}
                        rightSwipe={handlePlayerIn}
                        leftSwipe={handlePlayerOut}
                        statusLabel="?"
                        user={user}
                        isAdmin={game.adminId === user.uid}
                        
                    />
                </div>

            </div>
        </>
    );
};

export default PreGamePage;
