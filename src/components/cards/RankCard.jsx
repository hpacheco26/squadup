import React from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, Shield, Minus } from 'lucide-react';

const rankThemes = {
  0: { frame: '#b0b8c4', ring: '#dde2e8', bg: '#f4f6f8', accent: '#8994a3', label: 'Unranked' },
  1: { frame: '#cd7f32', ring: '#e8a860', bg: '#fdf3e7', accent: '#b5692a', label: 'Bronze' },
  2: { frame: '#a0a0a0', ring: '#c8c8c8', bg: '#f5f5f5', accent: '#808080', label: 'Silver' },
  3: { frame: '#d4a817', ring: '#f0d04a', bg: '#fefce8', accent: '#b8920f', label: 'Gold' },
  4: { frame: '#5ba4c9', ring: '#8dc8e8', bg: '#eef7fc', accent: '#4a8db0', label: 'Platinum' },
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

  const sizeConfigs = {
    0: { cy: 100, outerR: 90, midR: 80, innerR: 75, ballR: 45 },
    1: { cy: 115, outerR: 115, midR: 100, innerR: 94, ballR: 45 },
    2: { cy: 100, outerR: 127, midR: 113, innerR: 106, ballR: 45 },
    3: { cy: 100, outerR: 105, midR: 91, innerR: 85, ballR: 45 },
    4: { cy: 100, outerR: 104, midR: 90, innerR: 84, ballR: 45 },
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
    ? <circle cx={cx} cy={cy} r={s.innerR} fill={theme.ring} opacity="0.25" />
    : <polygon points={polyPoints(shape.sides, cx, cy, s.innerR, shape.offset)} fill={theme.ring} opacity="0.25" />;

  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" style={{ width: size, height: size, maxWidth: '100%' }}>
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

const RankCard = ({ rank, groupName, stats, isAnimated, onClick }) => {
  const badgeSize = 'clamp(70px, 13dvh, 110px)';
  const theme = rankThemes[rank] || rankThemes[0];
  const wins = stats?.wins || 0;
  const draws = stats?.draws || 0;
  const losses = stats?.losses || 0;
  const totalGames = wins + draws + losses;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const badge = isAnimated ? (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <BadgeSVG rank={rank} size={badgeSize} />
    </motion.div>
  ) : (
    <BadgeSVG rank={rank} size={badgeSize} />
  );

  return (
    <div onClick={onClick} style={{
      background: '#fff',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      cursor: onClick ? 'pointer' : 'grab',
      border: `1px solid ${theme.ring}30`,
    }}>
      {/* Top half — badge area with rank-tinted background */}
      <div style={{
        background: `linear-gradient(180deg, ${theme.bg} 0%, #ffffff 100%)`,
        padding: 'clamp(10px, 2dvh, 20px) 16px clamp(6px, 1dvh, 12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ height: 'clamp(65px, 12dvh, 130px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {badge}
        </div>

        {/* Rank label */}
        <span style={{
          fontSize: '0.65rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: theme.frame,
          marginTop: '2px',
        }}>
          {theme.label}
        </span>

        {/* Group name */}
        <h2 style={{
          fontSize: 'clamp(0.95rem, 1.5dvh, 1.2rem)',
          fontWeight: '700',
          color: '#1e293b',
          margin: '4px 0 0',
          textAlign: 'center',
        }}>
          {groupName}
        </h2>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: 'clamp(8px, 1.2dvh, 14px) 12px',
        borderTop: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Trophy size={12} color="#16a34a" />
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>{wins}</span>
          </div>
          <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Wins</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Minus size={12} color="#94a3b8" />
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>{draws}</span>
          </div>
          <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Draws</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Swords size={12} color="#ef4444" />
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>{losses}</span>
          </div>
          <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Losses</span>
        </div>
        {totalGames > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: theme.accent }}>{winRate}%</span>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Win Rate</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankCard;
