function GroupCard({ name, sport, id }) {
    return (
        <div className="card">
            <div className="card-content">
                <h2 className="title is-4">{name}</h2>
                <p className="subtitle is-6">Sport: {sport}</p>
                <p>{id}</p>
            </div>
        </div>
    );
}

export default GroupCard;
