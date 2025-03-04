import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/groupStore";
import GroupCard from "../components/cards/GroupCard";
import useAuthStore from "../store/authStore";
import CreateGroupModal from "../components/modals/GroupModal";
import { getGroupRank } from "../utils/groupRank";
import SquadsHeaderBar from "../components/bars/SquadsHeaderBar";

function GroupsPage() {
    const { groups, fetchGroupsByPlayer } = useGroupStore();
    const navigate = useNavigate();
    const { user, playerData } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        fetchGroupsByPlayer(playerData.id);
    }, [user, navigate]);

    return (
        <>
        <SquadsHeaderBar />
            <div className="container p-4">
                <div className="columns is-multiline">
                    {groups.length > 0 ? (
                        groups.map((group) => (
                            <div
                                className="column is-one-third"
                                key={group.id} // Ensure this is unique for each group
                                onClick={() => navigate(`/groups/${group.id}`)} // Using groupId for navigation
                            >
                                <GroupCard name={group.name} sport={group.sport} rank={getGroupRank(group, user.uid)} />
                                
                            </div>
                        ))
                    ) : (
                        <p>No groups available.</p>
                    )}
                </div>

                {/* Group Creation Modal */}
                <CreateGroupModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </div>
        </>
    );
}

export default GroupsPage;
