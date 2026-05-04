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
  const badgeSize = 'clamp(140px, 26dvh, 220px)';
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
        padding: 'clamp(10px, 1.5dvh, 18px) 14px clamp(14px, 2dvh, 20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          height: 'clamp(136px, 26dvh, 228px)',
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
            {Array.from({ length: rank + 1 }, (_, i) => i).map((i) => {
              const isPentagon = rank === 3;
              const isHexagon = rank === 4;
              // Pentagon/hexagon ranks get a slightly faster orbit
              const baseDur = isPentagon ? 4.8 : isHexagon ? 5.2 : 6;
              const step = isPentagon ? 0.6 : isHexagon ? 0.7 : 0.8;
              const duration = baseDur + i * step;    // staggered speeds
              const delay = -(i * (duration / (rank + 1))); // distribute around circle
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
          marginTop: '10px',
        }}>
          {t(theme.labelKey)}
        </span>

        {/* Group name */}
        <h2 style={{
          fontSize: 'clamp(0.9rem, 1.5dvh, 1.12rem)',
          fontWeight: '700',
          color: 'var(--c-text)',
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
