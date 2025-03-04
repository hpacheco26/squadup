import { useState } from "react";
import { Plus } from "lucide-react";
import useAuthStore from "../../store/authStore";
import useGroupStore from "../../store/groupStore";

export default function CreateGroupModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [sport, setSport] = useState("");

    const { playerData } = useAuthStore(); // Get logged-in player
    const { addGroup } = useGroupStore(); // Function to add group

    // Ensure player data exists
    if (!playerData || !playerData.id || !playerData.firstName || !playerData.lastName) {
        console.log(playerData)
        console.error("Player data is missing or incomplete!");
        return null;
    }

    const handleSubmit = async () => {
        if (!groupName || !sport) return;

        const newGroup = {
            id: null,
            name: groupName,
            sport: sport,
            adminId: playerData.id,
            admin: `${playerData.firstName} ${playerData.lastName}`, 
            players: [
                {
                    id: playerData.id,
                    firstName: playerData.firstName,
                    lastName: playerData.lastName,
                    userId: playerData.userId,
                    rank: 0,
                    stats: { wins: 0, draws: 0, losses: 0 }
                }
            ]
        };
        
        await addGroup(newGroup); 
        setIsOpen(false);
        setGroupName("");
        setSport("");
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className="button is-primary is-rounded is-large fixed bottom-6 right-6"
                onClick={() => setIsOpen(true)}
            >
                <span className="icon">
                    <Plus size={24} />
                </span>
            </button>

            {/* Modal */}
            <div className={`modal ${isOpen ? "is-active" : ""}`}>
                <div className="modal-background" onClick={() => setIsOpen(false)}></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Create New Group</p>
                        <button className="delete" onClick={() => setIsOpen(false)}></button>
                    </header>
                    <section className="modal-card-body">
                        <div className="field">
                            <label className="label">Group Name</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Enter group name"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Sport</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    placeholder="Enter sport type"
                                    value={sport}
                                    onChange={(e) => setSport(e.target.value)}
                                />
                            </div>
                        </div>
                    </section>
                    <footer className="modal-card-foot">
                        <button className="button is-success" onClick={handleSubmit}>
                            Create Group
                        </button>
                        <button className="button" onClick={() => setIsOpen(false)}>
                            Cancel
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
}
