import React, { useEffect, useRef, useState } from "react";
import useGroupStore from "../store/groupStore";
import { useNavigate } from "react-router-dom";
import RankCard from "../components/cards/RankCard";
import useLanguageStore from '../store/languageStore';

const rankNames = ['Novice', 'Amateur', 'Intermediate', 'Pro', 'Legend'];
const rankColors = {
  0: '#c0c0c0',  // Novice — silver
  1: '#14b8a6',  // Amateur — turquoise green
  2: '#3b82f6',  // Intermediate — blue
  3: '#9b59b6',  // Pro — purple
  4: '#f0c832',  // Legend — gold
};

const RankPage = () => {
  const { myPlayer, group } = useGroupStore();
  const navigate = useNavigate();
  const { t } = useLanguageStore();
  const cardWrapperRef = useRef(null);
  const [fxMode, setFxMode] = useState(null); // 'up' | 'down' | null
  const [implodeKey, setImplodeKey] = useState(0); // forces re-mount of implode particles

  useEffect(() => {
    if (!myPlayer) return;
    const currentRank = myPlayer.rank ?? 0;
    const storageKey = `rank:lastSeen:${myPlayer.id}`;
    const previousRaw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    const previousRank = previousRaw == null ? null : Number(previousRaw);

    if (previousRank == null || currentRank > previousRank) {
      setFxMode('up');
    } else if (currentRank < previousRank) {
      setFxMode('down');
      setImplodeKey((k) => k + 1);
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(currentRank));
    }

    // Clear FX class after the longest animation finishes
    const clearTimer = setTimeout(() => setFxMode(null), 2300);
    return () => clearTimeout(clearTimer);
  }, [myPlayer]);

  if (!myPlayer) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('loading')}</p>;

  const rank = myPlayer.rank ?? 0;
  const name = rankNames[rank] || 'Novice';
  const color = rankColors[rank] || '#c0c0c0';
  const stats = myPlayer.stats || {};
  const totalGames = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0);

  // Implode particles — scattered start positions converging to card center
  const implodeParticles = Array.from({ length: 22 }, (_, i) => {
    const angle = (i / 22) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 120 + Math.random() * 140;
    return {
      ix: Math.cos(angle) * dist,
      iy: Math.sin(angle) * dist,
      delay: Math.random() * 0.35,
      dur: 1.1 + Math.random() * 0.6,
      size: 4 + Math.round(Math.random() * 4),
    };
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '24px',
    }}>
      {/* Card + Button wrapper — same width as home carousel card */}
      <div style={{ width: '100%', maxWidth: 'calc(83.33% - 15px)' }}>
        {/* Rank change banner */}
        {fxMode && (
          <div
            key={`banner-${implodeKey}-${fxMode}`}
            style={{
              textAlign: 'center',
              marginBottom: '12px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: fxMode === 'up' ? `${color}1f` : '#e573731f',
              border: `1px solid ${fxMode === 'up' ? `${color}66` : '#e5737366'}`,
              color: fxMode === 'up' ? color : '#c0392b',
              fontWeight: 800,
              fontSize: '0.95rem',
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              animation: 'rank-banner-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
          >
            {fxMode === 'up' ? `▲ ${t('rankedUp') || 'Ranked Up!'}` : `▼ ${t('rankedDown') || 'Ranked Down'}`}
          </div>
        )}

        {/* Badge with FX overlay */}
        <div ref={cardWrapperRef} style={{ position: 'relative' }}>
          {/* Outward shockwave ring (rank up) */}
          {fxMode === 'up' && (
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: `3px solid ${color}`,
                boxShadow: `0 0 24px ${color}cc, inset 0 0 24px ${color}80`,
                pointerEvents: 'none',
                zIndex: 2,
                animation: 'rank-shockwave 1s ease-out forwards',
              }}
            />
          )}

          {/* Imploding particles (rank down) */}
          {fxMode === 'down' && (
            <div
              key={implodeKey}
              aria-hidden
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                width: 0,
                height: 0,
                pointerEvents: 'none',
                zIndex: 2,
              }}
            >
              {implodeParticles.map((p, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: p.size,
                    height: p.size,
                    marginLeft: -p.size / 2,
                    marginTop: -p.size / 2,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                    '--ix': `${p.ix}px`,
                    '--iy': `${p.iy}px`,
                    animation: `rank-implode ${p.dur}s cubic-bezier(0.6, 0, 0.4, 1) ${p.delay}s forwards`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          )}

          <div style={{
            animation: fxMode === 'up'
              ? 'rank-up-jolt 0.9s ease-out'
              : fxMode === 'down'
                ? 'rank-down-sink 1.8s ease-in-out'
                : 'none',
            transformOrigin: 'center center',
          }}>
            <RankCard
              rank={rank}
              groupName={group?.name || "Unknown Group"}
              stats={stats}
              isAnimated={true}
            />
          </div>
        </div>

        {/* Continue */}
        <button
          onClick={() => group?.id && navigate(`/groups/${group.id}`)}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: '#5b7bb3',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            cursor: 'pointer',
          }}
        >
          {t('continue')}
        </button>
      </div>
    </div>
  );
};

export default RankPage;
