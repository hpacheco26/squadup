import React from 'react';
import { Card } from 'react-bulma-components';
import RankIcon from './RankIcon';

const PlayerCard = ({ player, status }) => {
    return (
        <Card className="mb-2 mx-2">
            <Card.Content>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="title is-5">{player.firstName} {player.lastName}</h3>
                        <RankIcon rank={player.rank} size={40} />
                    </div>
                    <div>{status}</div>
            </Card.Content>
        </Card>
    );
};

export default PlayerCard;
