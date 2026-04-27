import React, { useRef, useCallback } from "react";
import { ArrowLeftRight, ShieldBan, HeartPulse } from "lucide-react";
import RankIcon from "./RankIcon";

const SWIPE_THRESHOLD = 25;
// Pixels of movement required to lock into a horizontal swipe vs. let the page scroll vertically.
const DIRECTION_LOCK_PX = 8;

function SwipeTeamPlayer({ player, status, onSwipe, onInjury, onRecover, team, isCaptain, mode }) {
    const isInjured = mode === 'injured';
    const containerRef = useRef(null);
    const cardRef = useRef(null);
    const startXRef = useRef(null);
    const startYRef = useRef(null);
    const currentXRef = useRef(0);
    const draggingRef = useRef(false);
    const decidedRef = useRef(false);

    const getTranslatePercent = useCallback((clientX) => {
        if (!containerRef.current || startXRef.current === null) return 0;
        const width = containerRef.current.getBoundingClientRect().width;
        if (width === 0) return 0;
        const delta = ((clientX - startXRef.current) / width) * 100;
        if (isInjured) return Math.max(0, Math.min(SWIPE_THRESHOLD, delta));
        return Math.max(-SWIPE_THRESHOLD, Math.min(SWIPE_THRESHOLD, delta));
    }, [isInjured]);

    const applyTransform = useCallback((percent, smooth = false) => {
        if (!cardRef.current) return;
        cardRef.current.style.transition = smooth ? "transform 0.25s ease" : "none";
        cardRef.current.style.transform = `translateX(${percent}%)`;
    }, []);

    const onPointerDown = useCallback((e) => {
        // Don't preventDefault or capture here — that would block native vertical scrolling.
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        currentXRef.current = 0;
        draggingRef.current = false;
        decidedRef.current = false;
    }, []);

    const onPointerMove = useCallback((e) => {
        if (startXRef.current === null) return;

        if (!decidedRef.current) {
            const dx = e.clientX - startXRef.current;
            const dy = e.clientY - startYRef.current;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (absDy > DIRECTION_LOCK_PX && absDy > absDx) {
                // Vertical scroll — abandon swipe.
                startXRef.current = null;
                startYRef.current = null;
                decidedRef.current = true;
                return;
            }
            if (absDx > DIRECTION_LOCK_PX && absDx >= absDy) {
                decidedRef.current = true;
                draggingRef.current = true;
                try { containerRef.current?.setPointerCapture(e.pointerId); } catch { /* noop */ }
            } else {
                return;
            }
        }

        if (!draggingRef.current) return;
        if (e.cancelable) e.preventDefault();
        const percent = getTranslatePercent(e.clientX);
        currentXRef.current = percent;
        applyTransform(percent);
    }, [getTranslatePercent, applyTransform]);

    const onPointerUp = useCallback((e) => {
        const wasDragging = draggingRef.current;
        draggingRef.current = false;
        decidedRef.current = false;
        startXRef.current = null;
        startYRef.current = null;

        if (!wasDragging) return;

        try { containerRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }

        if (isInjured) {
            if (currentXRef.current >= SWIPE_THRESHOLD) onRecover?.();
        } else {
            if (currentXRef.current >= SWIPE_THRESHOLD) onSwipe?.();
            else if (currentXRef.current <= -SWIPE_THRESHOLD) onInjury?.();
        }

        currentXRef.current = 0;
        applyTransform(0, true);
    }, [onSwipe, onInjury, onRecover, applyTransform, isInjured]);

    return (
        <div style={{ margin: "8px 8px" }}>
            <div
                ref={containerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "6px",
                    touchAction: "pan-y",
                    userSelect: "none",
                    background: "#fff",
                }}
            >
                {/* Background: switch left / injury right (or recover for injured mode) */}
                <div style={{
                    position: "absolute",
                    top: "1px",
                    left: "1px",
                    right: "1px",
                    bottom: "1px",
                    borderRadius: "5px",
                    display: "flex",
                }}>
                    {isInjured ? (
                        <div style={{
                            flex: 1,
                            background: "#22c55e",
                            display: "flex",
                            alignItems: "center",
                            paddingLeft: "16px",
                            borderRadius: "5px",
                        }}>
                            <HeartPulse size={16} color="#fff" strokeWidth={2.5} />
                        </div>
                    ) : (
                        <>
                            <div style={{
                                flex: 1,
                                background: "#3b82f6",
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "16px",
                                borderRadius: "5px 0 0 5px",
                            }}>
                                <ArrowLeftRight size={16} color="#fff" strokeWidth={2.5} />
                            </div>
                            <div style={{
                                flex: 1,
                                background: "#f59e0b",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                paddingRight: "16px",
                                borderRadius: "0 5px 5px 0",
                            }}>
                                <ShieldBan size={16} color="#fff" strokeWidth={2.5} />
                            </div>
                        </>
                    )}
                </div>

                {/* Foreground card */}
                <div
                    ref={cardRef}
                    style={{
                        position: "relative",
                        zIndex: 10,
                        background: "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "14px 14px",
                        minHeight: "56px",
                        cursor: "grab",
                    }}
                >
                    {/* Status icon + Name */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {status && <span style={{ fontSize: "0.9rem" }}>{status}</span>}
                            <span style={{ fontSize: "1rem", fontWeight: "600", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {player?.firstName} {player?.lastName}
                            </span>
                            {isCaptain && (() => {
                                const captainColor = team === 'team2' ? '#e11d48' : '#0d9488';
                                return (
                                <span style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 'bold',
                                    color: captainColor,
                                    border: `1.5px solid ${captainColor}`,
                                    borderRadius: '4px',
                                    padding: '0 3px',
                                    lineHeight: '1.4',
                                    flexShrink: 0,
                                }}>C</span>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Rank icon */}
                    <RankIcon rank={player?.rank} size={24} />
                </div>
            </div>
        </div>
    );
}

export default SwipeTeamPlayer;
