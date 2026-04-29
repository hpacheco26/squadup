import React from "react";
import { Trophy, Percent, Activity } from "lucide-react";
import theme from "../../theme";

const StatCard = ({ icon: Icon, color, label, value, subtitle }) => (
  <div style={{
    flex: 1,
    minWidth: 0,
    background: '#fff',
    borderRadius: '12px',
    padding: '12px 10px',
    border: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '4px',
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: `${color}1f`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Icon size={16} color={color} strokeWidth={2.2} />
    </div>
    <span style={{
      fontSize: '0.6rem',
      fontWeight: 600,
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {label}
    </span>
    <span style={{
      fontSize: '0.95rem',
      fontWeight: 700,
      color: theme.text,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
    }}>
      {value}
    </span>
    {subtitle && (
      <span style={{ fontSize: '0.65rem', color: theme.textMuted }}>{subtitle}</span>
    )}
  </div>
);

const formatName = (p) => `${p.firstName}${p.lastName?.[0] ? ` ${p.lastName[0]}.` : ''}`;

const StatHighlights = ({ players, t }) => {
  const enriched = (players || []).map((p) => {
    const wins = p.stats?.wins || 0;
    const draws = p.stats?.draws || 0;
    const losses = p.stats?.losses || 0;
    const total = wins + draws + losses;
    return {
      ...p,
      _wins: wins,
      _total: total,
      _winRate: total > 0 ? wins / total : 0,
    };
  });

  if (enriched.length === 0 || enriched.every(p => p._total === 0)) return null;

  const mostWins = [...enriched].sort((a, b) => b._wins - a._wins)[0];
  const mostGames = [...enriched].sort((a, b) => b._total - a._total)[0];
  const eligible = enriched.filter(p => p._total >= 3);
  const bestWinRate = (eligible.length > 0 ? eligible : enriched)
    .sort((a, b) => b._winRate - a._winRate)[0];

  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      marginBottom: '20px',
    }}>
      <StatCard
        icon={Trophy}
        color="#5fb088"
        label={t('mostWins')}
        value={formatName(mostWins)}
        subtitle={`${mostWins._wins} W`}
      />
      <StatCard
        icon={Percent}
        color={theme.primary}
        label={t('bestWinRate')}
        value={formatName(bestWinRate)}
        subtitle={`${Math.round(bestWinRate._winRate * 100)}%`}
      />
      <StatCard
        icon={Activity}
        color="#a0aab9"
        label={t('mostGames')}
        value={formatName(mostGames)}
        subtitle={`${mostGames._total}`}
      />
    </div>
  );
};

export default StatHighlights;
