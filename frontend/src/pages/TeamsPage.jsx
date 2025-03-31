import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Columns, Card } from 'react-bulma-components';
import PlayersList from '../components/lists/PlayersList';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore'; // Assuming there's an auth store to get user info
import GameHeaderBar from '../components/bars/GameHeaderBar';

const TeamsPage = () => {


    const handleTeamSelectA = async (playerId) => {
        
    };

    const handleTeamSelectB = async (playerId) => {
        
    };


    return (
        <>
            <GameHeaderBar gameId={gameId} />
            <div className="container p-2" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <PlayersList 
                        players={teamA}
                        onSelectTeamB={handleSelectTeamB}
                        statusLabel="Team A"
                        user={user}
                        isAdmin={game.adminId === user.id}
                    />
                </Columns.Column>

                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <PlayersList
                        players={teamB}
                        onSelectTeamA={handleSelectTeamA}
                        statusLabel="Team B"
                        user={user}
                        isAdmin={game.adminId === user.id}
                    />
                </Columns.Column>

                <Columns.Column size={4} style={{ padding: '0px'}}>
                    <PlayersList
                        players={invited}
                        onSelectTeamA={handleSelectTeamA}
                        onSelectTeamB={handleSelectTeamB}
                        statusLabel="?"
                        user={user}
                        isAdmin={game.adminId === user.id}
                        
                    />
                </Columns.Column>

            </div>
        </>
    );
};

export default TeamsPage;
