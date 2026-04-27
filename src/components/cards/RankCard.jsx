import React from "react";
import { motion } from "framer-motion";
import { Trophy, Swords, Minus } from 'lucide-react';
import useLanguageStore from '../../store/languageStore';
import RankIcon from '../RankIcon';

const rankThemes = {
  0: { frame: '#b0b8c4', ring: '#dde2e8', bg: '#f4f6f8', accent: '#8994a3', labelKey: 'unranked' },
  1: { frame: '#cd7f32', ring: '#e8a860', bg: '#fdf3e7', accent: '#b5692a', labelKey: 'bronze' },
  2: { frame: '#a0a0a0', ring: '#c8c8c8', bg: '#f5f5f5', accent: '#808080', labelKey: 'silver' },
  3: { frame: '#d4a817', ring: '#f0d04a', bg: '#fefce8', accent: '#b8920f', labelKey: 'gold' },
  4: { frame: '#5ba4c9', ring: '#8dc8e8', bg: '#eef7fc', accent: '#4a8db0', labelKey: 'platinum' },
};

const RankCard = ({ rank, groupName, stats, isAnimated, onClick }) => {
  const { t } = useLanguageStore();
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
      <RankIcon rank={rank} size={badgeSize} />
    </motion.div>
  ) : (
    <RankIcon rank={rank} size={badgeSize} />
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
      {/* Top half — badge area */}
      <div style={{
        background: '#fff',
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
          {t(theme.labelKey)}
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
          <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('wins')}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Minus size={12} color="#94a3b8" />
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>{draws}</span>
          </div>
          <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('draws')}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Swords size={12} color="#ef4444" />
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1e293b' }}>{losses}</span>
          </div>
          <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('losses')}</span>
        </div>
        {totalGames > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: theme.accent }}>{winRate}%</span>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('winRate')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankCard;
