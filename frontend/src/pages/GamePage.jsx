import React, { useState, useEffect } from 'react';
import { Button, Columns, Card } from 'react-bulma-components';
import { useNavigate, useParams } from 'react-router-dom';
import { balanceTeams } from '../utils/teamBalancer';
import useGameStore from '../store/gameStore'; // Import Zustand store
import TeamList from '../components/TeamList'; // Import the TeamList component
import SubTimer from '../components/SubTimer'; // Import the SubTimer component
import EndGame from '../components/EndGame';

const GamePage = () => {
    const navigate = useNavigate();
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

    // Handle game end and rank updates
    const handleEndGame = (winningTeam) => {
        const isTeam1Winner = winningTeam === 1;
        
        const updatedPlayers = game.goingPlayers.map(player => {
            const isWinner = team1.includes(player) ? isTeam1Winner : !isTeam1Winner;
            return {
                ...player,
                rank: Math.max(0, Math.min(4, player.rank + (isWinner ? 1 : -1))),
                stats: {
                    ...player.stats,
                    wins: isWinner ? player.stats.wins + 1 : player.stats.wins,
                    losses: !isWinner ? player.stats.losses + 1 : player.stats.losses,
                    draws: player.stats.draws
                }
            };
        });

        updatePlayerRanks(updatedPlayers);
        setShowEndGameModal(false);
        navigate('/'); // Redirect after updating ranks
    };

    // // Function to handle substitution and update teams
    // const handleSubstitution = () => {
    //     const newTeam1 = [...team1];
    //     const newTeam2 = [...team2];

    //     // Move the first player to the last position for both teams
    //     newTeam1.push(newTeam1.shift()); // Move the first player of team1 to the last position
    //     newTeam2.push(newTeam2.shift()); // Move the first player of team2 to the last position

    //     // Update the teams state
    //     setTeam1(newTeam1);
    //     setTeam2(newTeam2);
    // };

    if (loading) {
        return <p>Loading game...</p>;
    }

    return (
        <div className="container p-6">
            <div className="columns is-centered">
                <Columns.Column size={4} className="has-text-centered">
                    <SubTimer team1={team1} team2={team2} />
                </Columns.Column>
                <Columns.Column size={2} className="has-text-centered">
                    <EndGame team1={team1} team2={team2} /> {/* Add EndGame Button */}
                </Columns.Column>
            </div>

            <section className="section">
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
            </section>
        </div>
    );
};

export default GamePage;
