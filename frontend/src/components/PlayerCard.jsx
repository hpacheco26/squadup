function PlayerCard({ player, onRemovePlayer }) {
    const { id, firstName, lastName, rank, stats, userId } = player;
    const cardClass = userId ? 'card' : 'card has-background-grey-lighter'; // Apply grey background if no user ID

    const handleRemove = () => {
        if (onRemovePlayer) {
            onRemovePlayer(id);  // Pass the userId to the handler
        }
    };

    return (
        <div className={cardClass}>
            <div className="card-content">
                <h2 className="title is-4">{`${firstName} ${lastName}`}</h2>
                <p className="subtitle is-6">Rank: {rank}</p>
                <div className="content">
                    <p>Wins: {stats.wins}</p>
                    <p>Draws: {stats.draws}</p>
                    <p>Losses: {stats.losses}</p>
                </div>
            </div>
            {/* Remove Player Button */}
            {(
                <footer className="card-footer">
                    <button className="card-footer-item button is-danger" onClick={handleRemove}>
                        Remove Player
                    </button>
                </footer>
            )}
        </div>
    );
}

export default PlayerCard;
