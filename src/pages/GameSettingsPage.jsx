import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, CalendarDays, MapPin, Users, Settings2, Repeat, Minus, Plus, ClipboardList, Clock, Link2, ExternalLink } from 'lucide-react';
import useGameStore from '../store/gameStore';
import useGroupStore from '../store/groupStore';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import GameSettingsPageHeader from '../components/bars/AppHeaderBar';
import {
    SectionLabel, SettingsGroup, SettingsRow, settingsInputStyle, SettingsSegmented,
} from '../components/lists/SettingsList';

// Local stepper used for min/max/sub/price — bigger touch targets, no wheel mishaps.
const Stepper = ({ value, onChange, min = 0, max = 99, step = 1, suffix }) => {
    const num = Number(value) || 0;
    const dec = () => onChange(Math.max(min, +(num - step).toFixed(2)));
    const inc = () => onChange(Math.min(max, +(num + step).toFixed(2)));
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button type="button" onClick={dec} style={stepperBtn} aria-label="decrease">
                <Minus size={14} />
            </button>
            <div style={{
                minWidth: 48, textAlign: 'center', fontSize: '0.95rem', fontWeight: 600, color: '#1e293b',
                fontVariantNumeric: 'tabular-nums',
            }}>
                {suffix === '€' ? `€${num.toFixed(2)}` : num}{suffix && suffix !== '€' ? ` ${suffix}` : ''}
            </div>
            <button type="button" onClick={inc} style={stepperBtn} aria-label="increase">
                <Plus size={14} />
            </button>
        </div>
    );
};

const stepperBtn = {
    width: 30, height: 30, borderRadius: 15,
    border: '1px solid #e2e8f0', background: '#f8fafc',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#5b7bb3', cursor: 'pointer', flexShrink: 0,
};

const SectionTitle = ({ icon: Icon, children, action }) => (
    <SectionLabel
        action={action}
    >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {Icon && <Icon size={12} color="#64748b" />}
            {children}
        </span>
    </SectionLabel>
);

// Big tappable date/time tile. If `onOpen` is provided we delegate (used to
// open a custom bottom sheet); otherwise we fall back to the native picker.
const PickerTile = ({ icon: Icon, label, value, display, type, onChange, onOpen }) => {
    const inputRef = React.useRef(null);
    const open = () => {
        if (onOpen) { onOpen(); return; }
        const el = inputRef.current;
        if (!el) return;
        if (typeof el.showPicker === 'function') {
            try { el.showPicker(); return; } catch (_e) { /* fall through */ }
        }
        el.focus();
        el.click();
    };
    return (
        <button
            type="button"
            onClick={open}
            style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
                padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                fontFamily: 'inherit',
            }}
        >
            <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.7rem', fontWeight: 600, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
                {Icon && <Icon size={12} />} {label}
            </span>
            <span style={{
                fontSize: '1rem', fontWeight: 600,
                color: value ? '#1e293b' : '#94a3b8',
                fontVariantNumeric: 'tabular-nums',
            }}>
                {display || (type === 'date' ? '—' : '--:--')}
            </span>
            {/* Off-screen native input — receives showPicker() / click() (only when no custom onOpen) */}
            {!onOpen && (
                <input
                    ref={inputRef}
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    tabIndex={-1}
                    aria-hidden="true"
                    style={{
                        position: 'absolute', left: 0, bottom: 0,
                        width: 1, height: 1, opacity: 0, pointerEvents: 'none',
                        border: 0, padding: 0, margin: 0,
                    }}
                />
            )}
        </button>
    );
};

const formatDateDisplay = (iso, t) => {
    if (!iso) return '';
    // iso is yyyy-mm-dd from <input type="date">
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    const dt = new Date(y, m - 1, d);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    if (sameDay(dt, today)) return t?.('today') || 'Today';
    if (sameDay(dt, tomorrow)) return t?.('tomorrow') || 'Tomorrow';
    try {
        return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
        return iso;
    }
};

const isValidUrl = (s) => {
    if (!s) return false;
    try { new URL(s); return true; } catch { return false; }
};

// Presets derived from the chosen format. "ideal" = 2 * playersPerTeam.
const buildPresets = (playersPerTeam) => {
    const ideal = Math.max(2, (Number(playersPerTeam) || 5) * 2);
    return [
        { key: 'tight',    label: 'Tight',    sub: `${ideal}`,         min: ideal,     max: ideal },
        { key: 'balanced', label: 'Balanced', sub: `${ideal}–${ideal + 2}`, min: ideal,     max: ideal + 2 },
        { key: 'flexible', label: 'Flexible', sub: `${ideal}–${ideal + 4}`, min: ideal,     max: ideal + 4 },
    ];
};

const matchPreset = (presets, min, max) =>
    presets.find(p => p.min === Number(min) && p.max === Number(max))?.key || 'custom';

// Dual-thumb roster slider. Two native range inputs stacked on the same track.
const RosterRangeSlider = ({ minValue, maxValue, onChange, lo = 2, hi = 30 }) => {
    const trackPct = (v) => ((v - lo) / (hi - lo)) * 100;
    const minPct = trackPct(Math.max(lo, Math.min(maxValue, minValue)));
    const maxPct = trackPct(Math.max(minValue, Math.min(hi, maxValue)));
    const setMin = (v) => onChange(Math.min(Number(v), maxValue), maxValue);
    const setMax = (v) => onChange(minValue, Math.max(Number(v), minValue));

    return (
        <div style={{ padding: '4px 6px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{minValue}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{maxValue}</span>
            </div>
            <div style={{ position: 'relative', height: 28 }}>
                {/* Base track */}
                <div style={{
                    position: 'absolute', left: 0, right: 0, top: 12, height: 4,
                    background: '#e2e8f0', borderRadius: 999,
                }} />
                {/* Selected range */}
                <div style={{
                    position: 'absolute', top: 12, height: 4, borderRadius: 999,
                    left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%`,
                    background: '#5b7bb3',
                }} />
                {/* Min thumb input */}
                <input
                    type="range" min={lo} max={hi} step={1} value={minValue}
                    onChange={(e) => setMin(e.target.value)}
                    aria-label="minimum players"
                    className="range-thumb"
                    style={dualRangeStyle}
                />
                {/* Max thumb input */}
                <input
                    type="range" min={lo} max={hi} step={1} value={maxValue}
                    onChange={(e) => setMax(e.target.value)}
                    aria-label="maximum players"
                    className="range-thumb"
                    style={{ ...dualRangeStyle, zIndex: 2 }}
                />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, fontSize: '0.65rem', color: '#94a3b8' }}>
                <span>{lo}</span>
                <span>{hi}</span>
            </div>
        </div>
    );
};

const dualRangeStyle = {
    position: 'absolute', left: 0, right: 0, top: 0,
    width: '100%', height: 28, margin: 0, padding: 0,
    appearance: 'none', WebkitAppearance: 'none',
    background: 'transparent', pointerEvents: 'auto',
    cursor: 'pointer',
};

// Slide-up bottom sheet primitive.
const BottomSheet = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(15,23,42,0.45)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 640,
                    background: '#fff',
                    borderTopLeftRadius: 20, borderTopRightRadius: 20,
                    padding: '8px 16px calc(20px + env(safe-area-inset-bottom))',
                    boxShadow: '0 -10px 30px rgba(15,23,42,0.18)',
                }}
            >
                <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e2e8f0', margin: '4px auto 12px' }} />
                {title && (
                    <div style={{
                        fontSize: '1rem', fontWeight: 700, color: '#1e293b',
                        marginBottom: 14,
                    }}>{title}</div>
                )}
                {children}
            </div>
        </div>
    );
};

// Horizontal day-strip date sheet (next 14 days) + day/month/year picker.
const DateSheet = ({ open, value, onChange, onClose, t }) => {
    const days = React.useMemo(() => {
        const arr = [];
        const today = new Date(); today.setHours(0, 0, 0, 0);
        for (let i = 0; i < 14; i++) {
            const d = new Date(today); d.setDate(today.getDate() + i);
            const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            arr.push({ iso, date: d });
        }
        return arr;
    }, [open]);

    // Parse current value (or default to today) into D/M/Y for the picker.
    const today = new Date();
    const parsed = (() => {
        if (value) {
            const [y, m, d] = value.split('-').map(Number);
            if (y && m && d) return { y, m, d };
        }
        return { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
    })();
    const years = [today.getFullYear(), today.getFullYear() + 1];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthLabel = (m) => new Date(2000, m - 1, 1).toLocaleDateString(undefined, { month: 'short' });
    const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
    const daysList = Array.from({ length: daysInMonth(parsed.y, parsed.m) }, (_, i) => i + 1);

    const setPart = (part, val) => {
        const next = { ...parsed, [part]: Number(val) };
        // Clamp day if month/year change leaves it out of range.
        const dim = daysInMonth(next.y, next.m);
        if (next.d > dim) next.d = dim;
        const iso = `${next.y}-${String(next.m).padStart(2, '0')}-${String(next.d).padStart(2, '0')}`;
        onChange(iso);
    };

    return (
        <BottomSheet open={open} onClose={onClose} title={t('selectDate') || 'Select Date'}>
            <div style={{
                display: 'flex', gap: 8, overflowX: 'auto', overflowY: 'hidden',
                paddingBottom: 6, marginBottom: 16,
                scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-x',
            }}>
                {days.map(({ iso, date }, i) => {
                    const selected = iso === value;
                    return (
                        <button
                            key={iso}
                            type="button"
                            onClick={() => { onChange(iso); onClose(); }}
                            style={{
                                flex: '0 0 auto',
                                minWidth: 64, padding: '10px 6px',
                                borderRadius: 14,
                                border: selected ? '2px solid #5b7bb3' : '1px solid #e2e8f0',
                                background: selected ? '#eef2ff' : '#fff',
                                cursor: 'pointer', fontFamily: 'inherit',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                                touchAction: 'manipulation',
                            }}
                        >
                            <span style={{
                                fontSize: '0.62rem', fontWeight: 700, color: '#64748b',
                                textTransform: 'uppercase', letterSpacing: '0.4px',
                            }}>
                                {i === 0 ? (t('today') || 'Today')
                                    : i === 1 ? (t('tomorrow') || 'Tomorrow')
                                        : date.toLocaleDateString(undefined, { weekday: 'short' })}
                            </span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b' }}>{date.getDate()}</span>
                            <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                                {date.toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* D / M / Y wheel carousel */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12,
            }}>
                <WheelPicker label={t('day') || 'Day'} value={parsed.d} options={daysList} onChange={(v) => setPart('d', v)} />
                <WheelPicker label={t('month') || 'Month'} value={parsed.m} options={months} format={monthLabel} onChange={(v) => setPart('m', v)} />
                <WheelPicker label={t('year') || 'Year'} value={parsed.y} options={years} onChange={(v) => setPart('y', v)} />
            </div>
            <button
                type="button"
                onClick={onClose}
                style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    border: 'none', background: '#5b7bb3',
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                {t('done') || 'Done'}
            </button>
        </BottomSheet>
    );
};

const DmySelect = ({ label, value, options, format, onChange }) => (
    <label style={{
        display: 'flex', flexDirection: 'column', gap: 4,
        background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '8px 10px',
    }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                appearance: 'none', WebkitAppearance: 'none',
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '1rem', fontWeight: 600, color: '#1e293b',
                fontFamily: 'inherit', padding: '2px 0',
                cursor: 'pointer', touchAction: 'manipulation',
            }}
        >
            {options.map(o => (
                <option key={o} value={o}>{format ? format(o) : o}</option>
            ))}
        </select>
    </label>
);

// Snap-scroll wheel carousel. Each item is ITEM_H tall; container shows 5 items
// (top/bottom faded). Selected item sits in the center band. Works with touch
// flick + mouse wheel scroll.
const ITEM_H = 36;
const VISIBLE = 3;
const WheelPicker = ({ label, value, options, format, onChange }) => {
    const ref = React.useRef(null);
    const settleRef = React.useRef(null);
    const indexOfValue = Math.max(0, options.indexOf(value));

    // Sync external value -> scroll position.
    React.useEffect(() => {
        const el = ref.current; if (!el) return;
        const target = indexOfValue * ITEM_H;
        if (Math.abs(el.scrollTop - target) > 1) {
            el.scrollTo({ top: target, behavior: 'auto' });
        }
    }, [indexOfValue]);

    const handleScroll = () => {
        const el = ref.current; if (!el) return;
        clearTimeout(settleRef.current);
        settleRef.current = setTimeout(() => {
            const idx = Math.round(el.scrollTop / ITEM_H);
            const clamped = Math.max(0, Math.min(options.length - 1, idx));
            const snap = clamped * ITEM_H;
            if (Math.abs(el.scrollTop - snap) > 1) {
                el.scrollTo({ top: snap, behavior: 'smooth' });
            }
            const next = options[clamped];
            if (next !== value) onChange(next);
        }, 90);
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: 4,
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
            padding: '8px 10px',
        }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
            <div style={{ position: 'relative', height: ITEM_H * VISIBLE }}>
                {/* Center selection band */}
                <div style={{
                    position: 'absolute', left: -10, right: -10,
                    top: ITEM_H * Math.floor(VISIBLE / 2),
                    height: ITEM_H,
                    background: 'rgba(91,123,179,0.10)',
                    borderTop: '1px solid #e2e8f0',
                    borderBottom: '1px solid #e2e8f0',
                    pointerEvents: 'none', zIndex: 1,
                }} />
                {/* Top/bottom fade */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
                    background: 'linear-gradient(180deg, #f8fafc 0%, rgba(248,250,252,0) 30%, rgba(248,250,252,0) 70%, #f8fafc 100%)',
                }} />
                <div
                    ref={ref}
                    onScroll={handleScroll}
                    style={{
                        position: 'relative', zIndex: 3,
                        height: '100%', overflowY: 'auto', overflowX: 'hidden',
                        scrollSnapType: 'y mandatory',
                        scrollbarWidth: 'none', msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-y',
                    }}
                >
                    {/* Top spacer */}
                    <div style={{ height: ITEM_H * Math.floor(VISIBLE / 2) }} />
                    {options.map((o, i) => {
                        const selected = i === indexOfValue;
                        return (
                            <div
                                key={o}
                                onClick={() => onChange(o)}
                                style={{
                                    height: ITEM_H,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    scrollSnapAlign: 'center',
                                    fontSize: selected ? '1.05rem' : '0.9rem',
                                    fontWeight: selected ? 700 : 500,
                                    color: selected ? '#1e293b' : '#94a3b8',
                                    fontVariantNumeric: 'tabular-nums',
                                    cursor: 'pointer',
                                    transition: 'font-size 120ms, color 120ms, font-weight 120ms',
                                }}
                            >
                                {format ? format(o) : o}
                            </div>
                        );
                    })}
                    {/* Bottom spacer */}
                    <div style={{ height: ITEM_H * Math.floor(VISIBLE / 2) }} />
                </div>
            </div>
        </div>
    );
};

// 30-min slot grid time sheet + native fallback.
const TimeSheet = ({ open, value, onChange, onClose, t }) => {
    const slots = React.useMemo(() => {
        const arr = [];
        for (let h = 16; h <= 23; h++) {
            for (let m = 0; m < 60; m += 30) {
                arr.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }
        }
        return arr;
    }, []);

    // Parse current value (or default 19:00) into hour/minute for the wheels.
    const parsed = (() => {
        if (value && /^\d{1,2}:\d{2}$/.test(value)) {
            const [h, m] = value.split(':').map(Number);
            return { h: Math.max(0, Math.min(23, h)), m: Math.max(0, Math.min(59, m)) };
        }
        return { h: 19, m: 0 };
    })();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
    const pad = (n) => String(n).padStart(2, '0');
    const setPart = (part, val) => {
        const next = { ...parsed, [part]: Number(val) };
        onChange(`${pad(next.h)}:${pad(next.m)}`);
    };

    return (
        <BottomSheet open={open} onClose={onClose} title={t('selectTime') || 'Select Time'}>
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16,
            }}>
                {slots.map((slot) => {
                    const selected = slot === value;
                    return (
                        <button
                            key={slot}
                            type="button"
                            onClick={() => { onChange(slot); onClose(); }}
                            style={{
                                padding: '10px 6px', borderRadius: 12,
                                border: selected ? '2px solid #5b7bb3' : '1px solid #e2e8f0',
                                background: selected ? '#eef2ff' : '#fff',
                                color: '#1e293b', fontWeight: 600, fontSize: '0.95rem',
                                cursor: 'pointer', fontVariantNumeric: 'tabular-nums', fontFamily: 'inherit',
                                touchAction: 'manipulation',
                            }}
                        >
                            {slot}
                        </button>
                    );
                })}
            </div>

            {/* Hour / Minute wheel carousel */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12,
            }}>
                <WheelPicker label={t('hour') || 'Hour'} value={parsed.h} options={hours} format={pad} onChange={(v) => setPart('h', v)} />
                <WheelPicker label={t('minute') || 'Minute'} value={parsed.m} options={minutes} format={pad} onChange={(v) => setPart('m', v)} />
            </div>
            <button
                type="button"
                onClick={onClose}
                style={{
                    width: '100%', padding: '12px', borderRadius: 12,
                    border: 'none', background: '#5b7bb3',
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: 'pointer', fontFamily: 'inherit',
                }}
            >
                {t('done') || 'Done'}
            </button>
        </BottomSheet>
    );
};

function GameSettingsPage() {
    const { gameId, groupId: routeGroupId } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguageStore();
    const { user, playerData } = useAuthStore();
    const { group, subscribeToGroup } = useGroupStore();
    const { game, subscribeToGame, createGame, updateGame, deleteGame, loading } = useGameStore();

    const isEditMode = !!gameId;

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [locationUrl, setLocationUrl] = useState('');
    const [maxPlayers, setMaxPlayers] = useState(12);
    const [minPlayers, setMinPlayers] = useState(10);
    const [subTime, setSubTime] = useState(5);
    const [recurrence, setRecurrence] = useState('none');
    const [price, setPrice] = useState(0);
    const [playersPerTeam, setPlayersPerTeam] = useState(5);
    const [rosterCustom, setRosterCustom] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hydrated, setHydrated] = useState(false);
    const [dateSheetOpen, setDateSheetOpen] = useState(false);
    const [timeSheetOpen, setTimeSheetOpen] = useState(false);
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

    // Subscribe to game (edit) or group (create)
    useEffect(() => {
        if (isEditMode) {
            const unsub = subscribeToGame(gameId);
            return unsub;
        }
    }, [gameId, isEditMode, subscribeToGame]);

    useEffect(() => {
        const gid = isEditMode ? game?.groupId : routeGroupId;
        if (gid) {
            const unsub = subscribeToGroup(gid);
            return unsub;
        }
    }, [isEditMode, game?.groupId, routeGroupId, subscribeToGroup]);

    // Hydrate form once game loads (edit mode)
    useEffect(() => {
        if (isEditMode && game && !hydrated) {
            setDate(game.date || '');
            setTime(game.time || '');
            setLocation(game.location || '');
            setLocationUrl(game.locationUrl || '');
            setMaxPlayers(game.maxPlayers || 10);
            setMinPlayers(game.minPlayers || 5);
            setSubTime(game.subTime || 5);
            setRecurrence(game.recurrence || 'none');
            setPrice(game.price || 0);
            setPlayersPerTeam(game.playersPerTeam || 5);
            // Open custom slider on hydrate when stored values don't match any preset
            const presets = buildPresets(game.playersPerTeam || 5);
            if (matchPreset(presets, game.minPlayers || 5, game.maxPlayers || 10) === 'custom') {
                setRosterCustom(true);
            }
            setHydrated(true);
        }
    }, [isEditMode, game, hydrated]);

    const goBack = () => {
        if (isEditMode && game) {
            // Return to where the user came from (game/pregame screen)
            navigate(-1);
        } else if (routeGroupId) {
            navigate(`/groups/${routeGroupId}`);
        } else {
            navigate(-1);
        }
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        const baseGroupId = isEditMode ? (game?.groupId || group?.id) : routeGroupId;

        const gameData = {
            status: isEditMode ? game.status : 'open',
            date, time, location,
            locationUrl: locationUrl || null,
            maxPlayers, minPlayers,
            playersInvited: isEditMode ? game.playersInvited : (group?.players || []),
            playersIn: isEditMode ? game.playersIn : [],
            playersOut: isEditMode ? game.playersOut : [],
            teamA: isEditMode ? game.teamA : [],
            teamB: isEditMode ? game.teamB : [],
            subTime,
            recurrence,
            price: Number(price) || 0,
            playersPerTeam: Number(playersPerTeam) || 5,
            payments: isEditMode ? game.payments || {} : {},
            groupId: baseGroupId,
        };

        if (isEditMode) {
            await updateGame(game.id, gameData);
            setSubmitting(false);
            navigate(-1);
        } else {
            gameData.adminId = user?.uid || null;
            gameData._senderName = playerData?.firstName || 'Someone';
            gameData._groupName = group?.name || '';
            const created = await createGame(gameData);
            setSubmitting(false);
            if (created?.id) navigate(`/pregame/${created.id}`);
            else if (baseGroupId) navigate(`/groups/${baseGroupId}`);
        }
    };

    const handleCancelGame = async () => {
        if (!game) return;
        const gameGroupId = game.groupId || group?.id;
        const allPlayers = [...(game.playersIn || []), ...(game.playersOut || []), ...(game.playersInvited || [])];
        await deleteGame(game.id, {
            groupId: gameGroupId,
            groupName: group?.name || '',
            gameDate: game.date || '',
            senderName: playerData?.firstName || 'Someone',
            senderId: user?.uid,
            allPlayers,
        });
        if (gameGroupId) navigate(`/groups/${gameGroupId}`);
        else navigate('/');
    };

    if (isEditMode && !game) {
        return (
            <>
                <GameSettingsPageHeader onBack={goBack} title={t('gameSettings')} />
                <p style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>{t('loading')}</p>
            </>
        );
    }

    const headerTitle = isEditMode ? t('gameSettings') : t('scheduleGame');

    return (
        <>
            <GameSettingsPageHeader onBack={goBack} title={headerTitle} />

            <div style={{ flex: 1, overflowY: 'auto', background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)' }}>
                <div style={{ padding: '8px 12px 16px', maxWidth: 640, margin: '0 auto' }}>

                    {/* WHEN */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
                        <PickerTile
                            icon={CalendarDays}
                            label={t('date') || 'Date'}
                            value={date}
                            display={formatDateDisplay(date, t)}
                            type="date"
                            onChange={setDate}
                            onOpen={() => setDateSheetOpen(true)}
                        />
                        <PickerTile
                            icon={Clock}
                            label={t('time') || 'Time'}
                            value={time}
                            display={time || '--:--'}
                            type="time"
                            onChange={setTime}
                            onOpen={() => setTimeSheetOpen(true)}
                        />
                    </div>

                    {/* WHERE */}
                    <div style={{
                        background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0',
                        padding: 12, marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10,
                    }}>
                        {/* Place input with leading icon */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0',
                            padding: '10px 12px',
                        }}>
                            <MapPin size={16} color="#5b7bb3" style={{ flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder={t('locationPlaceholder')}
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={{
                                    flex: 1, minWidth: 0,
                                    border: 'none', outline: 'none', background: 'transparent',
                                    fontSize: '0.9rem', color: '#1e293b', fontFamily: 'inherit',
                                }}
                            />
                        </div>

                        {/* Map link input with leading icon + open button */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0',
                            padding: '10px 12px',
                        }}>
                            <Link2 size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                            <input
                                type="url"
                                inputMode="url"
                                placeholder={t('mapsLinkPlaceholder')}
                                value={locationUrl}
                                onChange={(e) => setLocationUrl(e.target.value)}
                                style={{
                                    flex: 1, minWidth: 0,
                                    border: 'none', outline: 'none', background: 'transparent',
                                    fontSize: '0.85rem', color: '#1e293b', fontFamily: 'inherit',
                                }}
                            />
                            {locationUrl && isValidUrl(locationUrl) && (
                                <a
                                    href={locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                        color: '#5b7bb3', fontSize: '0.75rem', fontWeight: 600,
                                        textDecoration: 'none', flexShrink: 0,
                                    }}
                                >
                                    {t('open') || 'Open'} <ExternalLink size={12} />
                                </a>
                            )}
                        </div>
                        <p style={{ margin: '0 4px', fontSize: '0.7rem', color: '#94a3b8' }}>
                            {t('mapsLinkOptional')}
                        </p>
                    </div>

                    {/* PLAYERS */}
                    <SectionTitle icon={Users}>{t('playersLabel')}</SectionTitle>
                    <SettingsGroup>
                        <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: 8, borderBottom: '1px solid #f1f5f9' }}>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                                {t('format') || 'Format'}
                            </span>
                            <SettingsSegmented
                                fullWidth
                                value={String(playersPerTeam)}
                                onChange={(v) => {
                                    const next = Number(v);
                                    setPlayersPerTeam(next);
                                    // Auto-snap roster to the "Balanced" preset for the new format
                                    const balanced = buildPresets(next).find(p => p.key === 'balanced');
                                    if (balanced) {
                                        setMinPlayers(balanced.min);
                                        setMaxPlayers(balanced.max);
                                        setRosterCustom(false);
                                    }
                                }}
                                options={[
                                    { value: '5', label: '5v5' },
                                    { value: '6', label: '6v6' },
                                    { value: '7', label: '7v7' },
                                    { value: '11', label: '11v11' },
                                ]}
                            />
                        </div>
                        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500, color: '#1e293b' }}>
                                    {t('rosterRange') || 'Roster size'}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#5b7bb3', fontVariantNumeric: 'tabular-nums' }}>
                                    {Number(minPlayers) === Number(maxPlayers) ? `${minPlayers}` : `${minPlayers}–${maxPlayers}`}
                                </p>
                            </div>
                            {(() => {
                                const presets = buildPresets(playersPerTeam);
                                const activeKey = matchPreset(presets, minPlayers, maxPlayers);
                                return (
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {presets.map(p => {
                                            const active = activeKey === p.key;
                                            return (
                                                <button
                                                    key={p.key}
                                                    type="button"
                                                    onClick={() => { setMinPlayers(p.min); setMaxPlayers(p.max); setRosterCustom(false); }}
                                                    style={{
                                                        flex: 1, padding: '8px 6px', borderRadius: 10,
                                                        border: active ? '1px solid #5b7bb3' : '1px solid #e2e8f0',
                                                        background: active ? 'rgba(91,123,179,0.10)' : '#fff',
                                                        color: active ? '#1e293b' : '#475569',
                                                        cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                                        alignItems: 'center', gap: 2, fontFamily: 'inherit',
                                                    }}
                                                >
                                                    <span style={{ fontSize: '0.78rem', fontWeight: active ? 600 : 500 }}>{p.label}</span>
                                                    <span style={{ fontSize: '0.7rem', color: active ? '#5b7bb3' : '#94a3b8', fontVariantNumeric: 'tabular-nums' }}>{p.sub}</span>
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() => setRosterCustom(c => !c)}
                                            style={{
                                                flex: 1, padding: '8px 6px', borderRadius: 10,
                                                border: (rosterCustom || activeKey === 'custom') ? '1px solid #5b7bb3' : '1px solid #e2e8f0',
                                                background: (rosterCustom || activeKey === 'custom') ? 'rgba(91,123,179,0.10)' : '#fff',
                                                color: (rosterCustom || activeKey === 'custom') ? '#1e293b' : '#475569',
                                                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', gap: 2, fontFamily: 'inherit',
                                            }}
                                        >
                                            <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>{t('custom') || 'Custom'}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{rosterCustom ? '▴' : '▾'}</span>
                                        </button>
                                    </div>
                                );
                            })()}
                            {rosterCustom && (
                                <RosterRangeSlider
                                    minValue={Number(minPlayers) || 2}
                                    maxValue={Number(maxPlayers) || 2}
                                    onChange={(mn, mx) => { setMinPlayers(mn); setMaxPlayers(mx); }}
                                    lo={2}
                                    hi={Math.max(30, (Number(playersPerTeam) || 5) * 3)}
                                />
                            )}
                        </div>
                    </SettingsGroup>

                    {/* GAME */}
                    <SectionTitle icon={Settings2}>{t('game') || 'Game'}</SectionTitle>
                    <SettingsGroup>
                        <SettingsRow label={t('subTimer')} sublabel="min" chevron={false}>
                            <Stepper value={subTime} onChange={setSubTime} min={1} max={60} />
                        </SettingsRow>
                        <SettingsRow label={t('priceLabel')} chevron={false} last>
                            <Stepper value={price} onChange={setPrice} min={0} max={200} step={0.5} suffix="€" />
                        </SettingsRow>
                    </SettingsGroup>

                    {/* REPEAT */}
                    <SectionTitle icon={Repeat}>{t('repeat')}</SectionTitle>
                    <SettingsGroup>
                        <div style={{ padding: '12px 14px' }}>
                            <SettingsSegmented
                                fullWidth
                                value={recurrence}
                                onChange={setRecurrence}
                                options={[
                                    { value: 'none', label: t('none') },
                                    { value: 'weekly', label: t('weekly') },
                                    { value: 'monthly', label: t('monthly') },
                                ]}
                            />
                        </div>
                    </SettingsGroup>

                    {/* CANCEL GAME (edit mode only) */}
                    {isEditMode && (
                        <SettingsGroup>
                            <SettingsRow
                                label={t('cancelGame')}
                                icon={Trash2}
                                danger
                                onClick={() => setCancelConfirmOpen(true)}
                                last
                            />
                        </SettingsGroup>
                    )}
                </div>
            </div>

            {/* STICKY CTA */}
            <div style={{
                position: 'sticky', bottom: 0, left: 0, right: 0,
                padding: '12px 16px calc(12px + env(safe-area-inset-bottom))',
                background: 'linear-gradient(180deg, rgba(238,242,247,0) 0%, #eef2f7 40%)',
                pointerEvents: 'none',
            }}>
                <button
                    onClick={handleSubmit}
                    disabled={loading || submitting}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 14,
                        background: '#5b7bb3', color: '#fff', border: 'none',
                        fontSize: '1rem', fontWeight: 700, letterSpacing: '0.3px',
                        cursor: (loading || submitting) ? 'not-allowed' : 'pointer',
                        opacity: (loading || submitting) ? 0.7 : 1,
                        boxShadow: '0 8px 22px rgba(91,123,179,0.35)',
                        pointerEvents: 'auto',
                    }}
                >
                    {(loading || submitting)
                        ? (isEditMode ? t('updating') : t('creating'))
                        : (isEditMode ? t('updateGame') : t('scheduleGame'))}
                </button>
            </div>

            <DateSheet
                open={dateSheetOpen}
                value={date}
                onChange={setDate}
                onClose={() => setDateSheetOpen(false)}
                t={t}
            />
            <TimeSheet
                open={timeSheetOpen}
                value={time}
                onChange={setTime}
                onClose={() => setTimeSheetOpen(false)}
                t={t}
            />

            <BottomSheet
                open={cancelConfirmOpen}
                onClose={() => !submitting && setCancelConfirmOpen(false)}
                title={t('cancelGameConfirmTitle') || 'Cancel this game?'}
            >
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={() => setCancelConfirmOpen(false)}
                        style={{
                            flex: 1, padding: '13px', borderRadius: 12,
                            border: '1px solid #e2e8f0', background: '#fff',
                            color: '#1e293b', fontSize: '0.95rem', fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        {t('keepGame') || 'Keep Game'}
                    </button>
                    <button
                        type="button"
                        disabled={submitting}
                        onClick={async () => {
                            if (submitting) return;
                            setSubmitting(true);
                            try { await handleCancelGame(); }
                            finally { setSubmitting(false); setCancelConfirmOpen(false); }
                        }}
                        style={{
                            flex: 1, padding: '13px', borderRadius: 12,
                            border: 'none',
                            background: '#e57373',
                            color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(229,115,115,0.28)',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            opacity: submitting ? 0.7 : 1,
                            fontFamily: 'inherit',
                        }}
                    >
                        {t('cancelGame') || 'Cancel Game'}
                    </button>
                </div>
            </BottomSheet>
        </>
    );
}

export default GameSettingsPage;
