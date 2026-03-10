import React from "react";
import { motion } from "framer-motion";

const rankThemes = {
  0: { frame: '#b0b8c4', ring: '#c8d0dc', glow: 'none' },
  1: { frame: '#cd7f32', ring: '#e0944a', glow: 'drop-shadow(0 0 6px rgba(205,127,50,0.4))' },
  2: { frame: '#c0c0c0', ring: '#d8d8d8', glow: 'drop-shadow(0 0 8px rgba(192,192,192,0.5))' },
  3: { frame: '#ffd700', ring: '#ffe44d', glow: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))' },
  4: { frame: '#4dd4e6', ring: '#7ae8f5', glow: 'drop-shadow(0 0 12px rgba(77,212,230,0.5))' },
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

const BadgeSVG = ({ rank, size = 150 }) => {
  const theme = rankThemes[rank] || rankThemes[0];
  const shape = shapeConfigs[rank] || shapeConfigs[0];
  const id = `badge-${rank}-${Math.random().toString(36).slice(2, 7)}`;
  const cx = 100;

  // Per-rank sizing so all shapes fill the same visual space
  const sizeConfigs = {
    0: { cy: 100, outerR: 90, midR: 80, innerR: 75, ballR: 45 },   // circle
    1: { cy: 115, outerR: 115, midR: 100, innerR: 94, ballR: 45 },  // triangle — shifted down
    2: { cy: 100, outerR: 127, midR: 113, innerR: 106, ballR: 45 }, // square — scaled by √2
    3: { cy: 100, outerR: 105, midR: 91, innerR: 85, ballR: 45 },    // pentagon
    4: { cy: 100, outerR: 104, midR: 90, innerR: 84, ballR: 45 },   // hexagon
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
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ filter: theme.glow }}>
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

      {/* Soccer ball */}
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

const rankNames = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum'];

const RankCard = ({ rank, groupName, stats, isAnimated }) => {
  const badge = isAnimated ? (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <BadgeSVG rank={rank} />
    </motion.div>
  ) : (
    <BadgeSVG rank={rank} />
  );

  const theme = rankThemes[rank] || rankThemes[0];
  const name = rankNames[rank] || 'Unranked';

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px 20px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      <div style={{ height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {badge}
      </div>

      {/* Rank Name */}
      <p style={{
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        color: theme.frame,
        marginBottom: '4px',
      }}>
        {name}
      </p>

      {/* Group Name */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>
        {groupName}
      </h2>

      {/* Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        borderTop: '1px solid #e2e8f0',
        paddingTop: '14px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats?.wins || 0}</p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wins</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats?.draws || 0}</p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Draws</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{stats?.losses || 0}</p>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Losses</p>
        </div>
      </div>
    </div>
  );
};

export default RankCard;
