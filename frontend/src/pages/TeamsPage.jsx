import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'react-bulma-components';
import { balanceTeams } from '../utils/teamBalancer';
import TeamList from '../components/lists/TeamList';
import useGameStore from '../store/gameStore';
import GameHeaderBar from '../components/bars/GameHeaderBar';

const TeamsPage = () => {
    const { gameId } = useParams();
    const { game, fetchGameById, loading } = useGameStore();
    const [team1, setTeam1] = useState([]);
    const [team2, setTeam2] = useState([]);

    useEffect(() => {
        if (gameId) {
            fetchGameById(gameId);
        }
    }, [gameId, fetchGameById]);

    useEffect(() => {
        if (game?.playersIn?.length > 0) {
            const { team1, team2 } = balanceTeams(game.playersIn);
            setTeam1(team1);
            setTeam2(team2);
        }
    }, [game]);

    if (loading || !game) {
        return <p>Loading teams...</p>;
    }

    return (
        <>
            <GameHeaderBar gameId={gameId} />
            <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Card>
                    <Card.Content>
                        <h2 className="title is-4">Team 1</h2>
                        <TeamList team={team1} />
                    </Card.Content>
                </Card>

                <Card>
                    <Card.Content>
                        <h2 className="title is-4">Team 2</h2>
                        <TeamList team={team2} />
                    </Card.Content>
                </Card>
            </div>
        </>
    );
};

export default TeamsPage;
