import { useState } from "react";
import useAuthStore from "../../store/authStore";
import useGroupStore from "../../store/groupStore";
import useLanguageStore from '../../store/languageStore';
import PaywallModal from './PaywallModal';

export default function CreateGroupModal({ isOpen, setIsOpen }) {
    const [groupName, setGroupName] = useState("");
    const [sport, setSport] = useState("Futebol"); // Default to "Futebol"
    const [showPaywall, setShowPaywall] = useState(false);

    const { playerData, canJoinMoreGroups } = useAuthStore(); // Get logged-in player
    const { addGroup } = useGroupStore();
    const { t } = useLanguageStore(); // Function to add group

    // Ensure player data exists
    if (!playerData || !playerData.id || !playerData.firstName || !playerData.lastName) {
        console.log(playerData);
        console.error("Player data is missing or incomplete!");
        return null;
    }

    const handleSubmit = async () => {
        if (!groupName || !sport) return;

        const allowed = await canJoinMoreGroups();
        if (!allowed) {
            setShowPaywall(true);
            return;
        }

        const newGroup = {
            id: null,
            name: groupName,
            sport: sport,
            adminIds: [playerData.userId],
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
        setSport("Futebol"); 
    };

    return (
        <>
        <div className={`modal ${isOpen ? "is-active" : ""}`}>
            <div className="modal-background" onClick={() => setIsOpen(false)}></div>
            <div className="modal-card p-2">
                <header className="modal-card-head" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', minHeight: '50px' }}>
                    <p className="modal-card-title" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{t('newGroup')}</p>
                    <button className="delete" aria-label="close" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}></button>
                </header>
                <section className="modal-card-body" style={{ padding: '20px' }}>
                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('groupName')}</label>
                    <div className="field" style={{ marginBottom: '16px' }}>
                        <div className="control">
                            <input
                                className="input"
                                type="text"
                                placeholder="e.g. Sunday League"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                style={{ borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <label className="label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('sport')}</label>
                    <div className="field">
                        <div className="control">
                            <div className="select is-fullwidth">
                                <select value={sport} onChange={(e) => setSport(e.target.value)} style={{ borderRadius: '8px' }}>
                                    <option value="Futebol">Futebol</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>
                <footer className="modal-card-foot" style={{ display: 'flex', justifyContent: 'center', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        className="button btn-primary"
                        style={{ background: 'var(--c-primary)', color: '#fff', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px', border: 'none', cursor: 'pointer' }}
                        onClick={handleSubmit}
                    >
                        {t('createGroup')}
                    </button>
                </footer>
            </div>
        </div>
        <PaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            onSuccess={() => {
                setShowPaywall(false);
                handleSubmit();
            }}
        />
        </>
    );
}

// Styles for button alignment
const styles = {
    footer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        width: "100%",
    },
    button: {
        flex: 1, // Makes both buttons equal size
        maxWidth: "150px", // Sets a reasonable max width
    },
};

