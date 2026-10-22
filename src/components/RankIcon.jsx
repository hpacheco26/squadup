import PropTypes from 'prop-types';
import rank0 from '../assets/rank-0.png';
import rank1 from '../assets/rank-1.png';
import rank2 from '../assets/rank-2.png';
import rank3 from '../assets/rank-3.png';
import rank4 from '../assets/rank-4.png';

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
            }}
        />
    );
};

export default RankIcon;

RankIcon.propTypes = {
    rank: PropTypes.number,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
