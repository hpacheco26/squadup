import React, { useState, useEffect } from 'react';
import { Card } from 'react-bulma-components';
import { useParams } from 'react-router-dom';
import { balanceTeams } from '../utils/teamBalancer';
import useGameStore from '../store/gameStore'; 
import TeamList from '../components/lists/TeamList';
import SubTimer from '../components/SubTimer'; 
import EndGame from '../components/EndGame';
import GameHeaderBar from '../components/bars/GameHeaderBar';

const GamePage = () => {
    const { gameId } = useParams(); // Get game ID from URL params

    const { game, fetchGameById, loading } = useGameStore(); // Zustand store
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

    // Function to handle substitution and update teams
    const handleSubstitution = () => {
        const newTeam1 = [...team1];
        const newTeam2 = [...team2];

        // Move the first player to the last position for both teams
        newTeam1.push(newTeam1.shift()); // Move the first player of team1 to the last position
        newTeam2.push(newTeam2.shift()); // Move the first player of team2 to the last position

        // Update the teams state
        setTeam1(newTeam1);
        setTeam2(newTeam2);
    };

    if (loading) {
        return <p>Loading game...</p>;
    }

    return (
        <>
            <GameHeaderBar gameId={gameId} />
            <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <SubTimer team1={team1} team2={team2} onSubstitution={handleSubstitution} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <EndGame team1={team1} team2={team2} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Team 1 */}
                    <Card>
                        <Card.Content>
                            <h2 className="title is-4">Team 1</h2>
                            <TeamList team={team1} />
                        </Card.Content>
                    </Card>

                    {/* Team 2 */}
                    <Card>
                        <Card.Content>
                            <h2 className="title is-4">Team 2</h2>
                            <TeamList team={team2} />
                        </Card.Content>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default GamePage;
