import React from 'react';

const rankThemes = {
    0: { frame: '#b0b8c4', ring: '#dde2e8' },
    1: { frame: '#cd7f32', ring: '#e8a860' },
    2: { frame: '#a0a0a0', ring: '#c8c8c8' },
    3: { frame: '#d4a817', ring: '#f0d04a' },
    4: { frame: '#5ba4c9', ring: '#8dc8e8' },
};

const shapeConfigs = {
    0: { type: 'circle' },
    1: { type: 'polygon', sides: 3, offset: 0 },
    2: { type: 'polygon', sides: 4, offset: Math.PI / 4 },
    3: { type: 'polygon', sides: 5, offset: 0 },
    4: { type: 'polygon', sides: 6, offset: 0 },
};

const polyPoints = (n, cx, cy, r, offset = 0) =>
    Array.from({ length: n }, (_, i) => {
        const a = (2 * Math.PI * i) / n - Math.PI / 2 + offset;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');

const RankIcon = ({ rank, size = 30 }) => {
    const theme = rankThemes[rank] || rankThemes[0];
    const shape = shapeConfigs[rank] || shapeConfigs[0];
    const id = `ri-${rank}-${Math.random().toString(36).slice(2, 7)}`;
    const cx = 100;

    // Per-rank sizing so all shapes fill the same visual space
    const sizeConfigs = {
        0: { cy: 100, outerR: 90, midR: 80, innerR: 75 },   // circle
        1: { cy: 115, outerR: 115, midR: 100, innerR: 94 },  // triangle
        2: { cy: 100, outerR: 127, midR: 113, innerR: 106 }, // square
        3: { cy: 100, outerR: 105, midR: 91, innerR: 85 },   // pentagon
        4: { cy: 100, outerR: 104, midR: 90, innerR: 84 },   // hexagon
    };
    const s = sizeConfigs[rank] || sizeConfigs[0];
    const cy = s.cy;

    const outerShape = shape.type === 'circle'
        ? <circle cx={cx} cy={cy} r={s.outerR} fill={theme.frame} />
        : <polygon points={polyPoints(shape.sides, cx, cy, s.outerR, shape.offset)} fill={theme.frame} />;

    const midShape = shape.type === 'circle'
        ? <circle cx={cx} cy={cy} r={s.midR} fill="#fff" />
        : <polygon points={polyPoints(shape.sides, cx, cy, s.midR, shape.offset)} fill="#fff" />;

    const innerShape = shape.type === 'circle'
        ? <circle cx={cx} cy={cy} r={s.innerR} fill={theme.ring} opacity="0.3" />
        : <polygon points={polyPoints(shape.sides, cx, cy, s.innerR, shape.offset)} fill={theme.ring} opacity="0.3" />;

    return (
        <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
            <defs>
                <radialGradient id={`${id}-ball`} cx="0.4" cy="0.35" r="0.6">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#e8e8e8" />
                    <stop offset="100%" stopColor="#c0c0c0" />
                </radialGradient>
            </defs>
            {outerShape}
            {midShape}
            {innerShape}
            <circle cx={cx} cy={cy} r={45} fill={`url(#${id}-ball)`} stroke={theme.frame} strokeWidth="2.5" />
            <g transform={`translate(0, ${cy - 100})`}>
                <polygon points="100,65 110,74 107,85 93,85 90,74" fill="#333" />
                <polygon points="122,90 130,100 124,110 114,108 114,96" fill="#333" />
                <polygon points="78,90 70,100 76,110 86,108 86,96" fill="#333" />
                <polygon points="89,116 94,126 106,126 111,116 100,110" fill="#333" />
                <ellipse cx="90" cy="82" rx="15" ry="11" fill="rgba(255,255,255,0.2)" />
            </g>
        </svg>
    );
};

export default RankIcon;
