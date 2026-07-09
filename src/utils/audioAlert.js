// Lightweight beep alert used by the manual substitution timer.
// Generated with the Web Audio API so no audio asset files are needed
// (keeps the PWA precache list untouched and works fully offline).
let audioCtx = null;

const beepOnce = (ctx, startTime) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
};

/** Plays a short triple-beep to signal the manual sub timer has elapsed. */
export function playSubBeep() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        if (!audioCtx) audioCtx = new Ctx();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        beepOnce(audioCtx, now);
        beepOnce(audioCtx, now + 0.4);
        beepOnce(audioCtx, now + 0.8);
    } catch {
        // Audio isn't critical to gameplay — fail silently.
    }
}
