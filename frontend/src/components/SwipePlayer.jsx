import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

function SwipPlayer({ player, playerStatus, onLeft, onRight }) {
    const [startX, setStartX] = useState(null);
    const [widthRoot, setWidthRoot] = useState(0);
    const [translateX, setTranslateX] = useState(0);
    const itemRef = useRef(null);

    useEffect(() => {
        function getWidthOfItem() {
            if (itemRef.current) {
                const { width } = itemRef.current.getBoundingClientRect();
                setWidthRoot(width);
            }
        }
        getWidthOfItem();
        window.addEventListener("resize", getWidthOfItem);

        return () => window.removeEventListener("resize", getWidthOfItem);
    }, []);

    // Handles both mouse and touch start
    function handleStart(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        setStartX(clientX);

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseup", handleEnd);

        document.addEventListener("touchmove", handleMove);
        document.addEventListener("touchend", handleEnd);
    }

    // Handles both mouse and touch move
    function handleMove(e) {
        if (startX !== null) {
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const deltaX = clientX - startX;
            const deltaXPercentage = Math.ceil((deltaX / widthRoot) * 100);

            const limitedTranslateX = Math.min(Math.max(deltaXPercentage, -25), 25);
            setTranslateX(limitedTranslateX);
        }
    }

    // Handles both mouse and touch end
    function handleEnd() {
        if (translateX >= 25 && onRight) {
            onRight();
        }

        if (translateX <= -25 && onLeft) {
            onLeft();
        }

        setStartX(null);
        setTranslateX(0);

        document.removeEventListener("mousemove", handleMove);
        document.removeEventListener("mouseup", handleEnd);

        document.removeEventListener("touchmove", handleMove);
        document.removeEventListener("touchend", handleEnd);
    }

    // Conditional styling based on the player status
    const getStatusColor = (status) => {
        switch (status) {
            case "IN":
                return "#16a34a";
            case "OUT":
                return "#ef4444";
            default:
                return "#94a3b8"; 
        }
    };

    return (
        <div ref={itemRef} className="swipeItemRootContainer" style={styles.swipeItemRootContainer}>
            <div
                onMouseDown={handleStart}
                onTouchStart={handleStart} 
                onMouseUp={handleEnd}
                onTouchEnd={handleEnd}
                onMouseMove={handleMove}
                onTouchMove={handleMove}
                style={{
                    ...styles.item,
                    transition: "0.2s ease",
                    transform: `translateX(${translateX}%)`,
                }}
                className="item"
            >
                <div className="content" style={styles.content}>
                    <div className="playerName" style={styles.playerName}>{player.firstName} {player.lastName}</div>
                    <div 
                        className="playerStatus" 
                        style={{
                            ...styles.playerStatus,
                            color: getStatusColor(playerStatus),
                        }}
                    >
                        {playerStatus}
                    </div>
                </div>
            </div>
            <div className="leftSide" style={styles.leftSide}>
                <FontAwesomeIcon icon={faCheck} style={styles.leftIcon} />
            </div>
            <div className="rightSide" style={styles.rightSide}>
                <FontAwesomeIcon icon={faXmark} style={styles.rightIcon} />
            </div>
        </div>
    );
}

const styles = {
    swipeItemRootContainer: {
        height: "60px",
        position: "relative",
        margin: "10px",
        overflow: "hidden",
        borderRadius: "15px",
    },

    item: {
        backgroundColor: "white",
        width: "100%",
        height: "100%",
        borderRadius: "15px",
        zIndex: "100",
        display: "flex",
        alignItems: "center",
        position: "relative",
    },

    content: {
        display: "flex",
    },

    playerName: {
        paddingLeft: "30px",
        fontSize: "20px",
    },

    playerStatus: {
        fontFamily: 'Racing Sans One, sans-serif',
        fontSize: "30px",
        fontWeight: "bold",
        position: "absolute",
        right: "15px",
        top: "50%",
        transform: "translateY(-50%)",
    },

    leftSide: {
        position: "absolute",
        top: "0",
        left: "0px",
        width: "50%",
        height: "100%",
        backgroundColor: "#4ade80",
        zIndex: "10",
        display: "flex",
        alignItems: "center",
    },

    rightSide: {
        position: "absolute",
        top: "0",
        right: "0px",
        width: "50%",
        height: "100%",
        backgroundColor: "#f87171",
        zIndex: "10",
        display: "flex",
        alignItems: "center",
    },

    leftIcon: {
        fontSize: "30px",
        color: "white",
        position: "absolute",
        left: "30px",
    },

    rightIcon: {
        fontSize: "30px",
        color: "white",
        position: "absolute",
        right: "30px",
    },
};

export default SwipPlayer;
