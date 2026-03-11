import React, { useRef, useCallback } from "react";
import { Check, X } from "lucide-react";

const STATUS_COLORS = {
    IN: "#16a34a",
    OUT: "#ef4444",
};

const SWIPE_THRESHOLD = 25;

function SwipePlayer({ player, playerStatus, onLeft, onRight }) {
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const startXRef = useRef(null);
    const currentXRef = useRef(0);
    const draggingRef = useRef(false);

    const getTranslatePercent = useCallback((clientX) => {
        if (!containerRef.current || startXRef.current === null) return 0;
        const width = containerRef.current.getBoundingClientRect().width;
        if (width === 0) return 0;
        const delta = ((clientX - startXRef.current) / width) * 100;
        return Math.max(-SWIPE_THRESHOLD, Math.min(SWIPE_THRESHOLD, delta));
    }, []);

    const applyTransform = useCallback((percent, smooth = false) => {
        if (!cardRef.current) return;
        cardRef.current.style.transition = smooth ? "transform 0.25s ease" : "none";
        cardRef.current.style.transform = `translateX(${percent}%)`;
    }, []);

    const onPointerDown = useCallback((e) => {
        e.preventDefault();
        draggingRef.current = true;
        startXRef.current = e.clientX;
        currentXRef.current = 0;
        applyTransform(0);
        containerRef.current?.setPointerCapture(e.pointerId);
    }, [applyTransform]);

    const onPointerMove = useCallback((e) => {
        if (!draggingRef.current) return;
        const percent = getTranslatePercent(e.clientX);
        currentXRef.current = percent;
        applyTransform(percent);
    }, [getTranslatePercent, applyTransform]);

    const onPointerUp = useCallback((e) => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        containerRef.current?.releasePointerCapture(e.pointerId);

        if (currentXRef.current >= SWIPE_THRESHOLD) onRight?.();
        else if (currentXRef.current <= -SWIPE_THRESHOLD) onLeft?.();

        currentXRef.current = 0;
        startXRef.current = null;
        applyTransform(0, true);
    }, [onLeft, onRight, applyTransform]);

    const statusColor = STATUS_COLORS[playerStatus] || "#94a3b8";

    return (
        <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
                position: "relative",
                margin: "6px 8px",
                overflow: "hidden",
                borderRadius: "6px",
                touchAction: "none",
                userSelect: "none",
                background: "#fff",
            }}
        >
            {/* Background: green left / red right */}
            <div style={{
                position: "absolute", top: "1px", left: "1px", right: "1px", bottom: "1px", display: "flex", borderRadius: "5px", overflow: "hidden",
            }}>
                <div style={{
                    flex: 1,
                    background: "#4ade80",
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "20px",
                }}>
                    <Check size={22} color="#fff" strokeWidth={3} />
                </div>
                <div style={{
                    flex: 1,
                    background: "#f87171",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "20px",
                }}>
                    <X size={22} color="#fff" strokeWidth={3} />
                </div>
            </div>

            {/* Foreground card */}
            <div
                ref={cardRef}
                style={{
                    position: "relative",
                    zIndex: 10,
                    background: "#fff",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    cursor: "grab",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
            >
                {/* Colored status bar on left edge */}
                <div style={{
                    position: "absolute",
                    left: 0,
                    top: "12px",
                    bottom: "12px",
                    width: "4px",
                    borderRadius: "0 4px 4px 0",
                    background: statusColor,
                }} />

                {/* Name */}
                <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b", flex: 1, paddingLeft: "8px" }}>
                    {player.firstName} {player.lastName}
                </span>

                {/* Status icon */}
                {playerStatus === "IN" && <Check size={18} color={statusColor} strokeWidth={2.5} />}
                {playerStatus === "OUT" && <X size={18} color={statusColor} strokeWidth={2.5} />}
                {playerStatus === "?" && <span style={{ fontSize: "1.1rem", color: statusColor, fontWeight: "bold" }}>?</span>}
            </div>
        </div>
    );
}

export default SwipePlayer;
