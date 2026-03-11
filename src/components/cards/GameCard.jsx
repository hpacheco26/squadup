import React from "react";
import { CheckCircle, XCircle, Clock, Lock, UserCheck, UserX, Mail } from "lucide-react";
import getMyInviteStatus from "../../utils/myInviteStatus";
import useAuthStore from '../../store/authStore';

const statusColors = {
    Open: { color: "has-background-info-light", icon: <Clock size={20} /> },
    Confirmed: { color: "has-background-success-light", icon: <CheckCircle size={20} /> },
    Closed: { color: "has-background-success-light", icon: <Lock size={20} /> },
    Cancelled: { color: "has-background-danger-light", icon: <XCircle size={20} /> }
};

const inviteStatusIcons = {
    in: { color: "has-background-success-light", icon: <UserCheck size={20} />, label: "In" },
    out: { color: "has-background-danger-light", icon: <UserX size={20} />, label: "Out" },
    invited: { color: "has-background-warning-light", icon: <Mail size={20} />, label: "Invited" }
};

const GameCard = ({ game }) => {
    const { color, icon } = statusColors[game.status] || { color: "is-light", icon: null };
    const { playerData } = useAuthStore();

    // Get player's invite status
    const myInviteStatus = getMyInviteStatus(game, playerData.id);
    const inviteStatus = inviteStatusIcons[myInviteStatus] || { color: "is-light", icon: null, label: "Unknown" };

    return (
        <div className="card shadow-lg" style={{ position: "relative" }}>
            <div className="card-content">
                {/* Game Location & Date */}
                <div className="head" style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="content">
                        <p className="title is-5 has-text-dark">{game.location}</p>
                        <p className="subtitle is-6 has-text-grey">{game.date} at {game.time}</p>
                    </div>
                    {/* Status Badge */}
                    <div className={`tag ${color} is-medium`} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {icon} <span>{game.status}</span>
                    </div>
                </div>

                {/* Players Info */}
                <div className="content">
                    <p><strong>Invited:</strong> {(game.playersInvited || []).length}</p>
                    <p><strong>In:</strong> {(game.playersIn || []).length}</p>
                    <p><strong>Out:</strong> {(game.playersOut || []).length}</p>
                </div>

                {/* Player Invite Status in Bottom Right */}
                <div
                    className={`tag ${inviteStatus.color} is-medium`}
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 12px",
                        borderRadius: "8px"
                    }}
                >
                    {inviteStatus.icon} <span>{inviteStatus.label}</span>
                </div>
            </div>
        </div>
    );
};

export default GameCard;
