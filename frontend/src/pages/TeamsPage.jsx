import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Columns } from 'react-bulma-components';
import TeamList from '../components/lists/TeamList';
import useGameStore from '../store/gameStore';
import GameHeaderBar from '../components/bars/GameHeaderBar';

const TeamsPage = () => {
    const { gameId } = useParams();
    const { game, fetchGameById, loading } = useGameStore();

    useEffect(() => {
        if (gameId) {
            fetchGameById(gameId);
        }
    }, [gameId, fetchGameById]);

    if (loading || !game) {
        return <p>Loading teams...</p>;
    }

    const teamA = game.teamA || [];
    const teamB = game.teamB || [];
    const invited = game.playersInvited || [];

    return (
        <>
            <GameHeaderBar gameId={gameId} />
            <div className="container p-2" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <h3 className="title is-5">Team A</h3>
                    <TeamList team={teamA} />
                </Columns.Column>

                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <h3 className="title is-5">Team B</h3>
                    <TeamList team={teamB} />
                </Columns.Column>

                {invited.length > 0 && (
                    <Columns.Column size={4} style={{ padding: '0px'}}>
                        <h3 className="title is-5">Unassigned</h3>
                        <TeamList team={invited} />
                    </Columns.Column>
                )}
            </div>
        </>
    );
};

export default TeamsPage;
