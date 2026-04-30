import React, { useRef, useCallback } from "react";
import { Check, X, UserPlus } from "lucide-react";

const STATUS_COLORS = {
    IN: "#5fb088",  // muted sage (matches InvitationBar)
    OUT: "#cf8b90", // dusty rose (matches InvitationBar)
};

const SWIPE_THRESHOLD = 25;
// Pixels of movement required to lock into a horizontal swipe vs. let the page scroll vertically.
const DIRECTION_LOCK_PX = 8;

/**
 * Reusable horizontal swipe card with a green left-reveal and red right-reveal.
 *
 * Two usage modes:
 *  1. **Default mode** (back-compat with PlayersList): pass `player` + `playerStatus`
 *     and the component renders its own avatar/name/status row.
 *  2. **Slot mode**: pass `children` to render any custom card content. Optional
 *     `leftAction` / `rightAction` override the reveal background + icon
 *     (e.g. blue + UserPlus for "add as guest").
 */
// Visually-hidden but focusable + clickable. Used for the WCAG SC 2.5.1
// keyboard / non-swipe alternatives below. zIndex sits above the foreground
// card (which is z=10) so programmatic clicks reach the button instead of
// being intercepted by the swipe surface.
const SR_ONLY = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0,
    background: 'transparent',
    zIndex: 20,
};

function SwipePlayer({
    player,
    playerStatus,
    onLeft,
    onRight,
    rightActionType,
    children,
    leftAction,
    rightAction,
}) {
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
        return Math.max(-SWIPE_THRESHOLD, Math.min(SWIPE_THRESHOLD, delta));
    }, []);

    const applyTransform = useCallback((percent, smooth = false) => {
        if (!cardRef.current) return;
        cardRef.current.style.transition = smooth ? "transform 0.25s ease" : "none";
        cardRef.current.style.transform = `translateX(${percent}%)`;
    }, []);

    const onPointerDown = useCallback((e) => {
        // Do NOT preventDefault or capture pointer here — that would block
        // native vertical scrolling. We decide direction on the first move.
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        currentXRef.current = 0;
        draggingRef.current = false;
        decidedRef.current = false;
    }, []);

    const onPointerMove = useCallback((e) => {
        if (startXRef.current === null) return;

        // Direction lock phase: figure out if this is a horizontal swipe or vertical scroll.
        if (!decidedRef.current) {
            const dx = e.clientX - startXRef.current;
            const dy = e.clientY - startYRef.current;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (absDy > DIRECTION_LOCK_PX && absDy > absDx) {
                // Vertical scroll — abandon swipe, let the browser scroll.
                startXRef.current = null;
                startYRef.current = null;
                decidedRef.current = true;
                return;
            }
            if (absDx > DIRECTION_LOCK_PX && absDx >= absDy) {
                // Horizontal swipe — claim the gesture.
                decidedRef.current = true;
                draggingRef.current = true;
                try { containerRef.current?.setPointerCapture(e.pointerId); } catch { /* noop */ }
            } else {
                return; // not enough movement yet
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

        if (currentXRef.current >= SWIPE_THRESHOLD) onRight?.();
        else if (currentXRef.current <= -SWIPE_THRESHOLD) onLeft?.();

        currentXRef.current = 0;
        applyTransform(0, true);
    }, [onLeft, onRight, applyTransform]);

    const statusColor = STATUS_COLORS[playerStatus] || "#a0aab9";

    // Reveal action defaults — `rightActionType="addGuest"` is preserved for
    // PlayersList back-compat. New callers should pass `leftAction`/`rightAction`.
    const resolvedLeft = leftAction || {
        color: rightActionType === 'addGuest' ? '#60a5fa' : '#5fb088',
        icon: rightActionType === 'addGuest'
            ? <UserPlus size={20} color="#fff" strokeWidth={3} />
            : <Check size={20} color="#fff" strokeWidth={3} />,
    };
    const resolvedRight = rightAction || {
        color: '#cf8b90',
        icon: <X size={20} color="#fff" strokeWidth={3} />,
    };

    const playerName = player ? `${player.firstName || ''} ${player.lastName || ''}`.trim() : '';
    // Labels are swipe-direction based, NOT semantic. Each page chooses what
    // a left-swipe vs. right-swipe means. Tests should follow the page.
    const leftLabel = resolvedLeft.label
        || (playerName ? `Swipe ${playerName} left` : 'Swipe left');
    const rightLabel = resolvedRight.label
        || (playerName ? `Swipe ${playerName} right` : 'Swipe right');

    return (
        <div
            ref={containerRef}
            data-player-id={player?.id}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{
                position: "relative",
                margin: "8px 8px",
                overflow: "hidden",
                borderRadius: "6px",
                touchAction: "pan-y",
                userSelect: "none",
                background: "#fff",
            }}
        >
            {/* WCAG 2.5.1 — keyboard / non-swipe alternative for the swipe gesture. */}
            {onLeft && (
                <button type="button" aria-label={leftLabel}
                    onClick={(e) => { e.stopPropagation(); onLeft(); }}
                    style={SR_ONLY}>{leftLabel}</button>
            )}
            {onRight && (
                <button type="button" aria-label={rightLabel}
                    onClick={(e) => { e.stopPropagation(); onRight(); }}
                    style={SR_ONLY}>{rightLabel}</button>
            )}
            {/* Background: configurable left/right reveal */}
            <div style={{
                position: "absolute", top: "1px", left: "1px", right: "1px", bottom: "1px", display: "flex", borderRadius: "5px", overflow: "hidden",
            }}>
                <div style={{
                    flex: 1,
                    background: resolvedLeft.color,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: "20px",
                }}>
                    {resolvedLeft.icon}
                </div>
                <div style={{
                    flex: 1,
                    background: resolvedRight.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingRight: "20px",
                }}>
                    {resolvedRight.icon}
                </div>
            </div>

            {/* Foreground card — custom slot or default player row */}
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
                    padding: "10px 14px",
                    minHeight: "44px",
                    cursor: "grab",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
            >
                {children ? children : (
                    <>
                        {/* Colored status bar on left edge */}
                        <div style={{
                            position: "absolute",
                            left: 0,
                            top: "10px",
                            bottom: "10px",
                            width: "4px",
                            borderRadius: "0 4px 4px 0",
                            background: statusColor,
                        }} />

                        {/* Name */}
                        <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "#1e293b", flex: 1, paddingLeft: "8px" }}>
                            {player.firstName} {player.lastName}
                        </span>

                        {/* Status icon */}
                        {playerStatus === "IN" && <Check size={20} color={statusColor} strokeWidth={2.5} />}
                        {playerStatus === "OUT" && <X size={20} color={statusColor} strokeWidth={2.5} />}
                        {playerStatus === "?" && <span style={{ fontSize: "1.15rem", color: statusColor, fontWeight: "bold" }}>?</span>}
                    </>
                )}
            </div>
        </div>
    );
}

export default SwipePlayer;
