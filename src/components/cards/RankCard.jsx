import React from "react";
import { motion } from "framer-motion";
import useLanguageStore from '../../store/languageStore';
import RankIcon from '../RankIcon';

// Tier names (via i18n keys): unranked=Novice, bronze=Amateur, silver=Intermediate, gold=Pro, platinum=Legend
const rankThemes = {
  0: { frame: '#c0c0c0', ring: '#dcdcdc', bg: '#f5f5f5', accent: '#9ca3af', labelKey: 'unranked' },    // Novice — silver
  1: { frame: '#14b8a6', ring: '#5eead4', bg: '#ecfdf5', accent: '#0d9488', labelKey: 'bronze' },     // Amateur — turquoise green
  2: { frame: '#3b82f6', ring: '#93c5fd', bg: '#eff6ff', accent: '#2563eb', labelKey: 'silver' },     // Intermediate — blue
  3: { frame: '#9b59b6', ring: '#c4a3d6', bg: '#f5eefa', accent: '#7e3fa1', labelKey: 'gold' },       // Pro — purple
  4: { frame: '#f0c832', ring: '#f7dc6f', bg: '#fefce8', accent: '#b8920f', labelKey: 'platinum' },   // Legend — gold
};

const RankCard = ({ rank, groupName, isAnimated, onClick }) => {
  const { t } = useLanguageStore();
  const badgeSize = 'clamp(112px, 19dvh, 176px)';
  const theme = rankThemes[rank] || rankThemes[0];

  const badge = isAnimated ? (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <RankIcon rank={rank} size={badgeSize} />
    </motion.div>
  ) : (
    <RankIcon rank={rank} size={badgeSize} />
  );

  return (
    <div onClick={onClick} style={{
      background: 'transparent',
      cursor: onClick ? 'pointer' : 'grab',
    }}>
      {/* Top half — badge area */}
      <div style={{
        background: 'transparent',
        padding: 'clamp(6px, 1dvh, 12px) 14px clamp(10px, 1.4dvh, 14px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          height: 'clamp(106px, 18dvh, 184px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
        }}>
          <div style={{
            position: 'absolute',
            bottom: 'clamp(4px, 0.8dvh, 9px)',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'clamp(70px, 11dvh, 120px)',
            height: 'clamp(14px, 2.2dvh, 24px)',
            borderRadius: '999px',
            background: `${theme.frame}2e`,
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }} />

          {/* Orbiting sparks */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}>
            {[0, 1, 2, 3].map((i) => {
              const isPentagon = rank === 3;
              const isHexagon = rank === 4;
              // Pentagon/hexagon ranks get a slightly faster orbit
              const baseDur = isPentagon ? 4.8 : isHexagon ? 5.2 : 6;
              const step = isPentagon ? 0.6 : isHexagon ? 0.7 : 0.8;
              const duration = baseDur + i * step;    // staggered speeds
              const delay = -(i * (duration / 4));    // distribute around circle
              const isTriangle = rank === 1;
              const isSquare = rank === 2;
              const size = isTriangle ? 10 : isSquare ? 9 : isPentagon ? 11 : isHexagon ? 13 : 8;
              // Hexagons spin in alternating directions with varied speeds
              const hexSpinDur = 2 + i * 0.7;            // 2.0, 2.7, 3.4, 4.1
              const hexSpinKeyframe = i % 2 === 0 ? 'rank-shape-spin' : 'rank-shape-spin-rev';
              return (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: size,
                    height: size,
                    '--orbit-radius': 'clamp(58px, 9.5dvh, 96px)',
                    animation: `rank-orbit ${duration}s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <span style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    borderRadius: isTriangle || isSquare || isPentagon || isHexagon ? (isSquare ? 1 : 0) : '50%',
                    background: theme.frame,
                    clipPath: isTriangle
                      ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                      : isPentagon
                        ? 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)'
                        : isHexagon
                          ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                          : 'none',
                    transform: isSquare ? 'rotate(45deg)' : 'none',
                    boxShadow: isTriangle || isPentagon || isHexagon ? 'none' : `0 0 4px ${theme.frame}80`,
                    filter: isTriangle || isPentagon || isHexagon
                      ? `drop-shadow(0 0 4px ${theme.frame}) drop-shadow(0 0 8px ${theme.frame}80)`
                      : 'none',
                    animation: isPentagon
                      ? `rank-spark-pulse 1.8s ease-in-out infinite, rank-shape-spin 3s linear infinite`
                      : isHexagon
                        ? `rank-spark-pulse 2s ease-in-out infinite, ${hexSpinKeyframe} ${hexSpinDur}s linear infinite`
                        : 'rank-spark-pulse 2.4s ease-in-out infinite',
                    animationDelay: `${i * 0.3}s`,
                  }} />
                </span>
              );
            })}

            {/* Twinkling background sparks (rank 2+) */}
            {rank >= 2 && [0, 1, 2, 3, 4, 5].map((i) => {
              // Pseudo-random fixed positions around the badge
              const positions = [
                { x: -55, y: -40 }, { x: 50, y: -50 }, { x: -65, y: 20 },
                { x: 60, y: 30 }, { x: -10, y: -65 }, { x: 15, y: 55 },
              ];
              const p = positions[i];
              return (
                <span
                  key={`sparkle-${i}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: 4,
                    transform: `translate(${p.x}px, ${p.y}px)`,
                  }}
                >
                  <span style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#fff',
                    boxShadow: `0 0 6px ${theme.frame}, 0 0 2px #fff`,
                    animation: `rank-spark-pulse ${1.5 + (i % 3) * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.35}s`,
                  }} />
                </span>
              );
            })}

            {/* Super Saiyan lightning bolts (rank 2 & 3 only) */}
            {(rank === 2 || rank === 3) && [
              { x: -48, y: -22, rot: -25, dur: 2.2, delay: 0,
                points: '12,0 9,16 13,17 10,38 14,15 10,14 14,2', w: 22, h: 38 },
              { x: 52, y: -18, rot: 35, dur: 2.6, delay: 0.6,
                points: '14,0 8,12 12,14 9,28 14,32 11,20 15,18 13,8', w: 22, h: 34 },
              { x: -38, y: 42, rot: -160, dur: 2.4, delay: 1.1,
                points: '10,0 8,10 12,12 7,22 12,20 9,32 14,30 11,18 14,16 11,8', w: 22, h: 36 },
              { x: 44, y: 38, rot: 155, dur: 2.8, delay: 1.7,
                points: '8,0 12,8 9,14 14,18 10,24 14,30 8,34 12,22 8,20 11,10', w: 22, h: 36 },
              { x: 5, y: -55, rot: 5, dur: 2.3, delay: 0.3,
                points: '11,0 8,14 12,15 9,30 14,12 11,11 14,2', w: 22, h: 32 },
              { x: -60, y: 8, rot: -95, dur: 2.5, delay: 1.4,
                points: '12,0 9,9 13,11 8,20 13,22 10,34 15,18 11,16 14,6', w: 22, h: 36 },
              { x: 58, y: 5, rot: 110, dur: 2.7, delay: 0.9,
                points: '10,0 13,6 9,12 14,16 9,22 13,28 8,34 12,18 8,16 11,8', w: 22, h: 36 },
            ].map((b, i) => (
              <span
                key={`bolt-${i}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: b.w,
                  height: b.h,
                  marginLeft: b.x,
                  marginTop: b.y,
                  pointerEvents: 'none',
                  '--rot': `${b.rot}deg`,
                  animation: `${rank >= 3 ? 'rank-lightning-intense' : 'rank-lightning'} ${rank >= 3 ? b.dur * 0.9 : b.dur}s linear infinite`,
                  animationDelay: `${b.delay}s`,
                  willChange: 'transform, opacity',
                }}
              >
                <svg viewBox={`0 0 ${b.w} ${b.h}`} width="100%" height="100%" style={{
                  filter: `drop-shadow(0 0 3px ${theme.frame}) drop-shadow(0 0 6px ${theme.frame}cc)`,
                  overflow: 'visible',
                }}>
                  <polygon
                    points={b.points}
                    fill="#fff"
                    stroke={theme.frame}
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            ))}

            {/* Rank 4: rising fire flames */}
            {rank === 4 && [
              { fx: -52, sway: 5, dur: 2.6, delay: 0,   size: 18 },
              { fx: -28, sway: -6, dur: 2.2, delay: 0.4, size: 22 },
              { fx: -8,  sway: 4, dur: 2.4, delay: 0.9, size: 26 },
              { fx: 14,  sway: -5, dur: 2.0, delay: 0.2, size: 24 },
              { fx: 36,  sway: 6, dur: 2.5, delay: 0.7, size: 20 },
              { fx: 56,  sway: -4, dur: 2.3, delay: 1.1, size: 18 },
              { fx: -40, sway: 5, dur: 1.9, delay: 1.5, size: 14 },
              { fx: 44,  sway: -5, dur: 2.1, delay: 1.8, size: 14 },
            ].map((f, i) => (
              <span
                key={`flame-${i}`}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: f.size,
                  height: f.size * 1.6,
                  marginLeft: -f.size / 2,
                  marginTop: 'clamp(28px, 5dvh, 56px)',
                  pointerEvents: 'none',
                  '--fx': `${f.fx}px`,
                  '--sway': `${f.sway}px`,
                  animation: `rank-flame-rise ${f.dur}s ease-out infinite, rank-flame-flicker ${f.dur * 0.4}s ease-in-out infinite`,
                  animationDelay: `${f.delay}s, ${f.delay}s`,
                  willChange: 'transform, opacity',
                }}
              >
                <svg viewBox="0 0 20 32" width="100%" height="100%" style={{
                  filter: `drop-shadow(0 0 4px ${theme.frame}) drop-shadow(0 0 10px ${theme.frame}aa)`,
                  overflow: 'visible',
                }}>
                  <defs>
                    <linearGradient id={`flame-grad-${i}`} x1="50%" y1="100%" x2="50%" y2="0%">
                      <stop offset="0%"  stopColor="#fff7d6" />
                      <stop offset="40%" stopColor={theme.frame} />
                      <stop offset="100%" stopColor="#ff5e3a" />
                    </linearGradient>
                  </defs>
                  {/* Teardrop flame: wide rounded base, pointed top */}
                  <path
                    d="M10 32 C 2 28, 1 18, 6 12 C 7 16, 9 14, 8 10 C 12 14, 14 8, 11 4 C 14 6, 17 10, 18 16 C 19 24, 16 30, 10 32 Z"
                    fill={`url(#flame-grad-${i})`}
                    opacity="0.95"
                  />
                </svg>
              </span>
            ))}
          </div>

          <div style={{ filter: `drop-shadow(0 6px 8px ${theme.frame}26)` }}>
            {badge}
          </div>
        </div>

        {/* Rank label */}
        <span style={{
          fontSize: '0.62rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1.8px',
          color: theme.frame,
          marginTop: '0',
        }}>
          {t(theme.labelKey)}
        </span>

        {/* Group name */}
        <h2 style={{
          fontSize: 'clamp(0.9rem, 1.5dvh, 1.12rem)',
          fontWeight: '700',
          color: '#1e293b',
          margin: '3px 0 0',
          textAlign: 'center',
          lineHeight: 1.2,
          minHeight: '2.4em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {groupName}
        </h2>
      </div>
    </div>
  );
};

export default RankCard;
