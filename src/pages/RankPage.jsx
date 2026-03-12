import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import useGroupStore from "../store/groupStore";
import { useNavigate } from "react-router-dom";
import RankCard from "../components/cards/RankCard";
import useLanguageStore from '../store/languageStore';

const rankNames = ['Unranked', 'Bronze', 'Silver', 'Gold', 'Platinum'];
const rankColors = {
  0: '#b0b8c4',
  1: '#cd7f32',
  2: '#c0c0c0',
  3: '#ffd700',
  4: '#4dd4e6',
};

const RankPage = () => {
  const { myPlayer, group } = useGroupStore();
  const navigate = useNavigate();
  const { t } = useLanguageStore();

  useEffect(() => {
    if (myPlayer) {
      const color = rankColors[myPlayer.rank] || '#b0b8c4';
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: [color, '#ffffff', '#333333'],
      });
    }
  }, [myPlayer]);

  if (!myPlayer) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('loading')}</p>;

  const rank = myPlayer.rank ?? 0;
  const name = rankNames[rank] || 'Unranked';
  const color = rankColors[rank] || '#b0b8c4';
  const stats = myPlayer.stats || {};
  const totalGames = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0);

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
        {/* Badge */}
        <RankCard
          rank={rank}
          groupName={group?.name || "Unknown Group"}
          stats={stats}
          isAnimated={true}
        />

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
