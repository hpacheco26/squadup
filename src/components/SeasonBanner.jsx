import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronRight, Trophy } from 'lucide-react';
import { BottomSheet } from './modals/BottomSheet';
import RankIcon from './RankIcon';
import useGroupStore from '../store/groupStore';
import { withSeasonDefaults } from '../utils/seasons';
import useLanguageStore from '../store/languageStore';

const shortName = (p) => `${p?.firstName || ''} ${p?.lastName?.[0] ? `${p.lastName[0]}.` : ''}`.trim();

/**
 * Current-season line with progress, plus a tap-to-open read-only history of
 * past seasons and their final standings. Purely presentational: reads the
 * group's season fields and fetches archived seasons on demand.
 */
const SeasonBanner = ({ group }) => {
    const { t } = useLanguageStore();
    const [open, setOpen] = useState(false);
    const [seasons, setSeasons] = useState(null);
    const [historyError, setHistoryError] = useState(false);
    const [retry, setRetry] = useState(0);
    const fetchSeasonHistory = useGroupStore(state => state.fetchSeasonHistory);

    const season = withSeasonDefaults(group || {});
    const pct = season.gamesPerSeason > 0
        ? Math.min(100, Math.round((season.seasonGamesPlayed / season.gamesPerSeason) * 100))
        : 0;

    useEffect(() => {
        if (!open || !group?.id) return undefined;
        let active = true;
        setSeasons(null);
        setHistoryError(false);
        fetchSeasonHistory(group.id)
            .then((s) => { if (active) setSeasons(s); })
            .catch(() => { if (active) setHistoryError(true); });
        return () => { active = false; };
    }, [open, group?.id, fetchSeasonHistory, retry]);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} style={styles.card}>
                <Trophy size={92} strokeWidth={1.5} color="var(--c-primary)" style={styles.watermark} />
                <div style={styles.topRow}>
                    <div style={styles.titleWrap}>
                        <span style={styles.chip}><Trophy size={15} color="var(--c-primary)" /></span>
                        <span style={styles.title}>{t('seasonN', { n: season.seasonNumber })}</span>
                    </div>
                    <span style={styles.historyLink}>
                        {t('seasonHistory')} <ChevronRight size={13} />
                    </span>
                </div>
                <div style={styles.progressMeta}>
                    <span style={styles.games}>{t('seasonProgress', { played: season.seasonGamesPlayed, total: season.gamesPerSeason })}</span>
                    <span style={styles.pct}>{pct}%</span>
                </div>
                <div style={styles.bar}><span style={{ ...styles.barFill, width: `${pct}%` }} /></div>
            </button>

            <BottomSheet open={open} onClose={() => setOpen(false)} title={t('seasonHistory')}>
                <div style={styles.historyScroll}>
                    {seasons === null && !historyError && <p role="status" style={styles.muted}>{t('loading')}</p>}
                    {historyError && (
                        <div style={styles.historyError}>
                            <p role="alert">{t('seasonHistoryLoadFailed')}</p>
                            <button type="button" style={styles.retryButton} onClick={() => setRetry(value => value + 1)}>
                                {t('seasonHistoryRetry')}
                            </button>
                        </div>
                    )}
                    {seasons && seasons.length === 0 && <p style={styles.muted}>{t('noPastSeasons')}</p>}
                    {seasons && seasons.map((s) => (
                        <div key={s.id} style={styles.seasonBlock}>
                            <div style={styles.row}>
                                <span style={styles.sTitle}>{t('seasonN', { n: s.number })}</span>
                                <span style={styles.endedBadge}>{t('seasonEndedBadge')}</span>
                            </div>
                            <p style={styles.sReason}>
                                {s.endReason === 'manual'
                                    ? t('seasonEndReasonManual')
                                    : t('seasonEndReasonTarget', { n: s.gamesPlayed })}
                            </p>
                            {s.number === 0 && <p style={styles.launch}>{t('launchSeasonNote')}</p>}
                            {s.gamesPlayed === 0 && <p style={styles.muted}>{t('noGamesThisSeason')}</p>}
                            <div style={styles.standings}>
                                {(s.standings || []).map((p, i) => (
                                    <div key={p.id} style={styles.standRow}>
                                        <span style={styles.pos}>{p.position || i + 1}</span>
                                        <span style={styles.pname}>{shortName(p)}</span>
                                        <RankIcon rank={p.rank || 0} size={18} />
                                        <span style={styles.wdl}>{p.wins}-{p.draws}-{p.losses}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </BottomSheet>
        </>
    );
};

SeasonBanner.propTypes = {
    group: PropTypes.shape({
        id: PropTypes.string.isRequired,
        seasonNumber: PropTypes.number,
        gamesPerSeason: PropTypes.number,
        seasonGamesPlayed: PropTypes.number,
    }).isRequired,
};

const styles = {
    card: {
        position: 'relative', overflow: 'hidden',
        display: 'block', width: '100%', textAlign: 'left', cursor: 'pointer',
        background: 'var(--c-surface)', border: '1px solid var(--c-border)',
        borderRadius: 16, padding: '16px', marginBottom: 16, fontFamily: 'inherit',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    },
    watermark: { position: 'absolute', bottom: -18, right: -14, opacity: 0.06, pointerEvents: 'none' },
    topRow: {
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14, gap: 8,
    },
    titleWrap: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
    chip: {
        flexShrink: 0, width: 32, height: 32, borderRadius: 10,
        background: 'var(--c-primary-light)', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
    },
    title: { fontSize: '1.1rem', fontWeight: 800, color: 'var(--c-text)', letterSpacing: '-0.2px' },
    historyLink: {
        flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 2,
        fontSize: '0.68rem', fontWeight: 700, color: 'var(--c-text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
    },
    progressMeta: {
        position: 'relative',
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 8,
    },
    games: { fontSize: '0.82rem', fontWeight: 600, color: 'var(--c-text-secondary)' },
    pct: { fontSize: '0.82rem', fontWeight: 800, color: 'var(--c-primary)' },
    bar: {
        position: 'relative',
        height: 8, borderRadius: 6, background: 'var(--c-border)', overflow: 'hidden',
    },
    barFill: { display: 'block', height: '100%', background: 'var(--c-primary)', borderRadius: 6, transition: 'width 0.4s ease' },
    historyScroll: { maxHeight: '60vh', overflowY: 'auto' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    muted: { color: 'var(--c-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' },
    historyError: { color: 'var(--c-danger)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' },
    retryButton: {
        border: '1px solid var(--c-border)', borderRadius: 8, padding: '8px 12px',
        background: 'var(--c-surface)', color: 'var(--c-text)', font: 'inherit', cursor: 'pointer',
    },
    seasonBlock: { padding: '12px 0', borderBottom: '1px solid var(--c-border)' },
    sTitle: { fontSize: '0.95rem', fontWeight: 700, color: 'var(--c-text)' },
    endedBadge: {
        fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.4px',
        background: 'var(--c-surface-alt, #e8edf5)', color: 'var(--c-text-secondary)',
        borderRadius: 20, padding: '4px 9px', textTransform: 'uppercase',
    },
    sReason: { fontSize: '0.75rem', color: 'var(--c-text-muted)', margin: '4px 0 0' },
    launch: { fontSize: '0.72rem', color: 'var(--c-text-secondary)', margin: '4px 0 0', fontStyle: 'italic' },
    standings: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 },
    standRow: {
        display: 'grid', gridTemplateColumns: '20px 1fr 24px 64px', alignItems: 'center',
        gap: 6, fontSize: '0.8rem', color: 'var(--c-text)',
    },
    pos: { color: 'var(--c-text-muted)', fontWeight: 700, textAlign: 'center' },
    pname: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    wdl: { textAlign: 'right', color: 'var(--c-text-secondary)', fontWeight: 600 },
};

export default SeasonBanner;
