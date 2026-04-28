import React from "react";
import { motion } from "framer-motion";
import useLanguageStore from '../../store/languageStore';
import RankIcon from '../RankIcon';

const rankThemes = {
  0: { frame: '#b0b8c4', ring: '#dde2e8', bg: '#f4f6f8', accent: '#8994a3', labelKey: 'unranked' },
  1: { frame: '#cd7f32', ring: '#e8a860', bg: '#fdf3e7', accent: '#b5692a', labelKey: 'bronze' },
  2: { frame: '#3b82f6', ring: '#93c5fd', bg: '#eff6ff', accent: '#2563eb', labelKey: 'silver' },
  3: { frame: '#d4a817', ring: '#f0d04a', bg: '#fefce8', accent: '#b8920f', labelKey: 'gold' },
  4: { frame: '#5ba4c9', ring: '#8dc8e8', bg: '#eef7fc', accent: '#4a8db0', labelKey: 'platinum' },
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
            background: `${theme.frame}55`,
            filter: 'blur(10px)',
            pointerEvents: 'none',
          }} />

          <div style={{ filter: `drop-shadow(0 8px 12px ${theme.frame}4a)` }}>
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
