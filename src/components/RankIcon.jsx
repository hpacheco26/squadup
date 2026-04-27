import React from 'react';
import rank0 from '../assets/rank-0.png';
import rank1 from '../assets/rank-1.png';
import rank2 from '../assets/rank-2.png';
import rank3 from '../assets/rank-3.png';
import rank4 from '../assets/rank-4.png';

const rankFilters = {
    0: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.28)) drop-shadow(0 0 3px rgba(148, 163, 184, 0.45))',
    1: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 4px rgba(34, 211, 238, 0.42))',
    2: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 4px rgba(29, 78, 216, 0.35))',
    3: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 4px rgba(124, 58, 237, 0.35))',
    4: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.2)) drop-shadow(0 0 4px rgba(245, 158, 11, 0.38))',
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
    const safeSize = Number.isFinite(size) ? Math.max(12, size) : 30;
    const src = rankImages[safeRank];
    const filter = rankFilters[safeRank];

    return (
        <img
            src={src}
            alt=""
            draggable={false}
            style={{
                display: 'inline-block',
                width: `${safeSize}px`,
                height: `${safeSize}px`,
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
