import useGroupStore from "../store/groupStore";
import { useNavigate } from "react-router-dom";
import RankCard from "../components/cards/RankCard";
import useLanguageStore from '../store/languageStore';

const RankPage = () => {
  const { myPlayer, group } = useGroupStore();
  const navigate = useNavigate();
  const { t } = useLanguageStore();

  if (!myPlayer) return <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>{t('loading')}</p>;

  const rank = myPlayer.rank ?? 0;
  const stats = myPlayer.stats || {};

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 'calc(83.33% - 15px)' }}>
        <RankCard
          rank={rank}
          groupName={group?.name || "Unknown Group"}
          stats={stats}
          isAnimated={true}
        />

        <button
          className="btn-primary"
          onClick={() => group?.id && navigate(`/groups/${group.id}`)}
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

export default RankPage;
