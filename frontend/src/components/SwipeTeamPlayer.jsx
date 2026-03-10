import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { Card } from "react-bulma-components";
import RankIcon from "./RankIcon";

function SwipeTeamPlayer({ player, status, onSwipe, team }) {
    const [startY, setStartY] = useState(null);
    const [heightRoot, setHeightRoot] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const itemRef = useRef(null);

    useEffect(() => {
        function getHeightOfItem() {
            if (itemRef.current) {
                const { height } = itemRef.current.getBoundingClientRect();
                setHeightRoot(height);
            }
        }
        getHeightOfItem();
        window.addEventListener("resize", getHeightOfItem);
        return () => window.removeEventListener("resize", getHeightOfItem);
    }, []);

    function handleStart(e) {
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        setStartY(clientY);
    }

    function handleMove(e) {
        if (startY === null) return;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - startY;
        const deltaYPercentage = Math.ceil((deltaY / (heightRoot || 1)) * 100);
        // Team 1 can only swipe down (positive), Team 2 can only swipe up (negative)
        let limited;
        if (team === 'team1') {
            limited = Math.min(Math.max(deltaYPercentage, 0), 50);
        } else {
            limited = Math.min(Math.max(deltaYPercentage, -50), 0);
        }
        setTranslateY(limited);
    }

    function handleEnd() {
        if (Math.abs(translateY) >= 50 && onSwipe) {
            onSwipe();
        }
        setStartY(null);
        setTranslateY(0);
    }

    const opacity = Math.min(Math.abs(translateY) / 50, 1);

    const teamShadow = team === 'team1'
        ? '0 4px 6px 0 rgba(13, 148, 136, 0.2)'
        : '0 4px 6px 0 rgba(185, 28, 28, 0.15)';

    return (
        <div style={{ margin: "10px 8px" }}>
            <div
                ref={itemRef}
                style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "6px",
                    boxShadow: teamShadow,
                }}
            >
            {/* Blue background behind the card */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#3b82f6",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: team === 'team1' ? "flex-start" : "flex-end",
                    justifyContent: "center",
                    padding: team === 'team1' ? "6px 0 0 0" : "0 0 6px 0",
                    opacity,
                    transition: startY !== null ? "none" : "opacity 0.2s ease",
                }}
            >
                <FontAwesomeIcon
                    icon={faArrowRightArrowLeft}
                    style={{ color: "#fff", fontSize: "14px", transform: "rotate(90deg)" }}
                />
            </div>

            {/* Swipeable card */}
            <div
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
                onMouseUp={handleEnd}
                onTouchEnd={handleEnd}
                onMouseLeave={() => {
                    if (startY !== null) handleEnd();
                }}
                style={{
                    position: "relative",
                    zIndex: 10,
                    transform: `translateY(${translateY}%)`,
                    transition: startY !== null ? "none" : "transform 0.2s ease",
                    cursor: "grab",
                    userSelect: "none",
                    touchAction: "none",
                }}
            >
                <Card style={{ boxShadow: 'none' }}>
                    <Card.Content style={{ padding: "8px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h3 className="title is-6" style={{ margin: 0 }}>
                                {status && <span style={{ marginRight: "6px" }}>{status}</span>}
                                {player?.firstName} {player?.lastName}
                            </h3>
                            <RankIcon rank={player?.rank} size={28} />
                        </div>
                    </Card.Content>
                </Card>
            </div>
        </div>
        </div>
    );
}

export default SwipeTeamPlayer;
