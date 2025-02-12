function PlayerCard({ name, rank, stats }) {
    return (
        <div className="card">
            <div className="card-content">
                <h2 className="title is-4">{name}</h2>
                <p className="subtitle is-6">Rank: {rank}</p>
                <div className="content">
                    <p>Wins: {stats.wins}</p>
                    <p>Draws: {stats.draws}</p>
                    <p>Losses: {stats.losses}</p>
                </div>
            </div>
        </div>
    );
}

export default PlayerCard;
