import React, { useState } from "react";
import { FiSettings, FiArrowLeft } from "react-icons/fi";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useGroupStore from "../../store/groupStore";
import useGameStore from "../../store/gameStore";
import GameModal from "../modals/GameModal";

const GameHeaderBar = ({ gameId }) => {
    const [isGameModalOpen, setIsGameModalOpen] = useState(false);
    const { group, updateGroup } = useGroupStore();
    const { game } = useGameStore();

    const navigate = useNavigate();
    const location = useLocation();
    // const { id } = useParams();
     // Extract game ID from URL

    // Active tab detection (ensures correct tab is highlighted)
    const isPreGameActive = location.pathname.includes(`/pregame/${gameId}`);
    const isGameActive = location.pathname.includes(`/game/${gameId}`);

    return (
        <>
            <header style={styles.header}>
                {/* Tabs: PreGame & Game */}
                <div style={styles.tabsContainer}>
                    <button 
                        onClick={() => navigate(`/groups/${group.id}`)} 
                    >
                        <IoIosArrowBack size={24} />
                    </button>

                    <button 
                        onClick={() => navigate(`/pregame/${gameId}`)} 
                        style={{ 
                            ...styles.tab, 
                            ...(isPreGameActive ? styles.activeTab : {}) 
                        }}
                    >
                        PreGame
                    </button>
                    <button 
                        onClick={() => navigate(`/game/${gameId}`)} 
                        style={{ 
                            ...styles.tab, 
                            ...(isGameActive ? styles.activeTab : {}) 
                        }}
                    >
                        Game
                    </button>
                </div>

                {/* Game Settings Button */}
                <button 
                    onClick={() => setIsGameModalOpen(true)} 
                    style={styles.settingsButton}
                    aria-label="Go to Game Settings"
                >
                    <FiSettings size={24} />
                </button>
            </header>

            {/* Game Settings Modal */}
            <GameModal 
                isOpen={isGameModalOpen} 
                setIsOpen={setIsGameModalOpen} 
                group={group}
                game={game}
            />
        </>
    );
};

const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
    },
    tabsContainer: {
        display: "flex",
        gap: "10px",
    },
    tab: {
        padding: "8px 16px",
        border: "none",
        background: "none",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#64748b",
        borderBottom: "3px solid transparent",
        transition: "color 0.3s, border-bottom 0.3s",
    },
    activeTab: {
        color: "#0d9488",
        borderBottom: "3px solid #0d9488",
    },
    settingsButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "5px",
    }
};

export default GameHeaderBar;
