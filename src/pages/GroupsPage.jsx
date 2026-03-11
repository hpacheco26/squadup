import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useGroupStore from "../store/groupStore";
import GroupCard from "../components/cards/GroupCard";
import useAuthStore from "../store/authStore";
import CreateGroupModal from "../components/modals/GroupModal";
import { getGroupRank } from "../utils/groupRank";
import SquadsHeaderBar from "../components/bars/SquadsHeaderBar";

function GroupsPage() {
    const { groups, subscribeToGroupsByPlayer } = useGroupStore();
    const navigate = useNavigate();
    const { user, playerData } = useAuthStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }
        const unsub = subscribeToGroupsByPlayer(playerData.id);
        return unsub;
    }, [user, navigate]);

    return (
        <>
        <SquadsHeaderBar />
            <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {groups.length > 0 ? (
                        groups.map((group, index) => (
                            <div
                                key={group.id || index}
                                onClick={() => group.id && navigate(`/groups/${group.id}`)}
                            >
                                <GroupCard name={group.name} sport={group.sport} rank={getGroupRank(group, user.uid)} />
                            </div>
                        ))
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '8px' }}>No groups yet</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5b7bb3', fontSize: '1rem', fontWeight: '600', textDecoration: 'underline', padding: 0 }}
                            >
                                Create First Group
                            </button>
                        </div>
                    )}

                {/* Group Creation Modal */}
                <CreateGroupModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
            </div>
        </>
    );
}

export default GroupsPage;
