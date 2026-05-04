import { useRef, useState } from 'react';
import RankCard from '../cards/RankCard';
import useLanguageStore from '../../store/languageStore';

const rankColors = {
  0: '#c0c0c0',
  1: '#14b8a6',
  2: '#3b82f6',
  3: '#9b59b6',
  4: '#f0c832',
};

/**
 * Full-screen interstitial shown when a player's rank changes.
 * Blocks all interaction until the user acknowledges.
 * @param {{ groupId: string, groupName: string, previousRank: number, newRank: number }} change
 * @param {() => void} onAcknowledge
 */
const RankChangeGate = ({ change, onAcknowledge }) => {
  const { t } = useLanguageStore();
  const cardWrapperRef = useRef(null);
  const [implodeKey] = useState(() => Math.random());

  const { groupName, previousRank, newRank } = change;
  const fxMode = newRank > previousRank ? 'up' : 'down';
  const color = rankColors[newRank] ?? '#c0c0c0';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 'calc(83.33% - 15px)' }}>
        {/* Group name */}
        <p
          style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '0.85rem',
            marginBottom: '6px',
            marginTop: 0,
            letterSpacing: '0.5px',
          }}
        >
          {groupName}
        </p>

        {/* Rank change banner */}
        <div
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
          {fxMode === 'up' ? `▲ ${t('rankedUp')}` : `▼ ${t('rankedDown')}`}
        </div>

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

          <div
            style={{
              animation:
                fxMode === 'up'
                  ? 'rank-up-jolt 0.9s ease-out'
                  : 'rank-down-sink 1.8s ease-in-out',
              transformOrigin: 'center center',
            }}
          >
            <RankCard rank={newRank} groupName={groupName} isAnimated />
          </div>
        </div>

        {/* Continue button */}
        <button
          className="btn-primary"
          onClick={onAcknowledge}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: 'var(--c-primary)',
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

export default RankChangeGate;
