import { Trophy, Crown } from 'lucide-react';
import PropTypes from 'prop-types';
import RankIcon from '../RankIcon';
import useLanguageStore from '../../store/languageStore';

const shortName = (p) => {
    if (!p) return '';
    const initial = p.lastName?.[0] ? `${p.lastName[0]}.` : '';
    return `${p.firstName || ''} ${initial}`.trim();
};

/**
 * Full-screen season-end recap, shown once when a player opens the app after
 * their group's season ended. Blocks interaction until acknowledged.
 * @param {object} recap  { groupName, seasonNumber, currentSeason, endReason,
 *   gamesPlayed, totalPlayers, position, rank, wins, draws, losses, champion,
 *   champions, sharedChampion }
 * @param {() => void} onAcknowledge
 */
const SeasonRecap = ({ recap, onAcknowledge }) => {
    const { t } = useLanguageStore();
    if (!recap) return null;

    const {
        groupName, seasonNumber, currentSeason, endReason,
        gamesPlayed, totalPlayers, position, rank, wins, draws, losses, champion, champions,
    } = recap;
    const winners = champions ?? (champion ? [champion] : []);
    const sharedChampion = recap.sharedChampion ?? winners.length > 1;

    const reason = endReason === 'manual'
        ? t('seasonEndReasonManual')
        : t('seasonEndReasonTarget', { n: gamesPlayed ?? '' });

    return (
        <div style={styles.overlay}>
            <div style={styles.inner}>
                <p style={styles.eyebrow}>{t('seasonComplete')}</p>
                {groupName && <p style={styles.group}>{groupName}</p>}
                <h1 style={styles.title}>{t('seasonEndedTitle', { n: seasonNumber })}</h1>
                <p style={styles.reason}>{reason}</p>
                {gamesPlayed === 0 && winners.length === 0 && <p style={styles.reason}>{t('noGamesThisSeason')}</p>}

                <div style={styles.card}>
                    <p style={styles.cardLabel}>{t('yourSeason')}</p>
                    <div style={styles.posRow}>
                        <span style={styles.position}>{position}</span>
                        <span style={styles.posMuted}>{t('leaderboardPosition', { pos: position, total: totalPlayers })}</span>
                    </div>
                    <div style={styles.statRow}>
                        <span style={styles.statMuted}>{t('finalRank')}</span>
                        <span style={styles.statValue}><RankIcon rank={rank || 0} size={20} /></span>
                    </div>
                    <div style={styles.statRow}>
                        <span style={styles.statMuted}>{t('yourRecord')}</span>
                        <span style={styles.statValue}>{wins} - {draws} - {losses}</span>
                    </div>
                </div>

                <div style={styles.card}>
                    <p style={styles.cardLabel}>{t('group')}</p>
                    <div style={styles.statRow}>
                        <span style={styles.statMuted}><Crown size={14} color="#f8d578" /> {t(sharedChampion ? 'sharedChampions' : 'champion')}</span>
                        <span style={styles.champions}>
                            {winners.length > 0
                                ? winners.map(shortName).join(', ')
                                : t('noSeasonChampion')}
                        </span>
                    </div>
                    <div style={styles.statRow}>
                        <span style={styles.statMuted}><Trophy size={14} color="#94a3b8" /> {t('gamesPlayedLabel')}</span>
                        <span style={styles.statValue}>{gamesPlayed ?? '—'}</span>
                    </div>
                </div>

                <button style={styles.button} onClick={onAcknowledge}>
                    {t('enterSeasonN', { n: currentSeason })}
                </button>
            </div>
        </div>
    );
};

const championType = PropTypes.shape({
    id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
});

SeasonRecap.propTypes = {
    recap: PropTypes.shape({
        groupName: PropTypes.string,
        seasonNumber: PropTypes.number.isRequired,
        currentSeason: PropTypes.number.isRequired,
        endReason: PropTypes.string,
        gamesPlayed: PropTypes.number,
        totalPlayers: PropTypes.number,
        position: PropTypes.number,
        rank: PropTypes.number,
        wins: PropTypes.number,
        draws: PropTypes.number,
        losses: PropTypes.number,
        champion: championType,
        champions: PropTypes.arrayOf(championType),
        sharedChampion: PropTypes.bool,
    }),
    onAcknowledge: PropTypes.func.isRequired,
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, overflowY: 'auto',
        background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 100%)',
    },
    inner: { width: '100%', maxWidth: 360, margin: 'auto' },
    eyebrow: {
        textAlign: 'center', color: '#65e0c4', fontSize: '0.72rem',
        fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 10px',
    },
    group: { textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 4px', letterSpacing: '0.5px' },
    title: { textAlign: 'center', color: '#f8d578', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px', lineHeight: 1.2 },
    reason: { textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 20px' },
    card: {
        background: '#16233b', border: '1px solid #2b3b57', borderRadius: 14,
        padding: 16, marginBottom: 14,
    },
    cardLabel: {
        color: '#8aa0bd', fontSize: '0.65rem', fontWeight: 800,
        letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px',
    },
    posRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
    position: { color: '#edf2fa', fontSize: '1.9rem', fontWeight: 850, lineHeight: 1 },
    posMuted: { color: '#9fb2cc', fontSize: '0.8rem' },
    statRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' },
    statMuted: { color: '#9fb2cc', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 6 },
    statValue: { color: '#edf2fa', fontSize: '0.9rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center' },
    champions: { color: '#edf2fa', fontSize: '0.9rem', fontWeight: 700, textAlign: 'right', maxWidth: '60%', overflowWrap: 'anywhere' },
    button: {
        width: '100%', marginTop: 8, padding: 14, borderRadius: 12, border: 'none',
        background: '#13775d', color: '#fff', fontSize: '1rem', fontWeight: 700,
        letterSpacing: '0.5px', cursor: 'pointer',
    },
};

export default SeasonRecap;
