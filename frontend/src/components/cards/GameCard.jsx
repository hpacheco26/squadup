import React from "react";
import { CheckCircle, XCircle, Clock, Lock } from "lucide-react";

const statusColors = {
    Open: { color: "has-background-info-light", icon: <Clock size={20} /> },
    Confirmed: { color: "has-background-success-light", icon: <CheckCircle size={20} /> },
    Closed: { color: "has-background-success-light", icon: <Lock size={20} /> },
    Cancelled: { color: "has-background-danger-light", icon: <XCircle size={20} /> }
};

const GameCard = ({ game }) => {
    const { color, icon } = statusColors[game.status] || { color: "is-light", icon: null };

    return (
        <div className="card shadow-lg">
            <div className="card-content">
                {/* Game Location & Date */}
                <div className="content">
                    <p className="title is-5 has-text-dark">{game.location}</p>
                    <p className="subtitle is-6 has-text-grey">{game.date} at {game.time}</p>
                </div>

                {/* Players Info */}
                <div className="content">
                    <p><strong>Invited:</strong> {game.invitedPlayers.length}</p>
                    <p><strong>In:</strong> {game.playersGoing.length}</p>
                    <p><strong>Out:</strong> {game.playersNotGoing.length}</p>
                </div>

                {/* Status Badge */}
                <div className={`tag ${color} is-medium`} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {icon} <span>{game.status}</span>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
