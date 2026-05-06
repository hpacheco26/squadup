import PropTypes from 'prop-types';
import rank0 from '../assets/rank-0.png';
import rank1 from '../assets/rank-1.png';
import rank2 from '../assets/rank-2.png';
import rank3 from '../assets/rank-3.png';
import rank4 from '../assets/rank-4.png';

// Glow colors match the canonical rank palette:
// 0 Novice #c0c0c0 (silver), 1 Amateur #14b8a6 (turquoise green), 2 Intermediate #3b82f6 (blue), 3 Pro #9b59b6 (purple), 4 Legend #f0c832 (gold)
const rankFilters = {
    0: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.28)) drop-shadow(0 0 4px rgba(192, 192, 192, 0.65))',
    1: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 5px rgba(20, 184, 166, 0.6))',
    2: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 5px rgba(59, 130, 246, 0.6))',
    3: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 5px rgba(155, 89, 182, 0.6))',
    4: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.2)) drop-shadow(0 0 5px rgba(240, 200, 50, 0.65))',
};

const rankImages = {
    0: rank0,
    1: rank1,
    2: rank2,
    3: rank3,
    4: rank4,
};

const clampRank = (rank) => {
    const n = Number.isFinite(rank) ? rank : Number(rank);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(4, Math.round(n)));
};

const RankIcon = ({ rank = 0, size = 30 }) => {
    const safeRank = clampRank(rank);
    const safeSize = Number.isFinite(size)
        ? `${Math.max(12, size)}px`
        : (typeof size === 'string' && size.trim() ? size : '30px');
    const src = rankImages[safeRank];
    const filter = rankFilters[safeRank];

    return (
        <img
            src={src}
            alt=""
            draggable={false}
            style={{
                display: 'inline-block',
                width: safeSize,
                height: safeSize,
                verticalAlign: 'middle',
                userSelect: 'none',
                pointerEvents: 'none',
                objectFit: 'contain',
                filter,
            }}
        />
    );
};

export default RankIcon;

RankIcon.propTypes = {
    rank: PropTypes.number,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
