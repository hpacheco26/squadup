import React from 'react';
import rank0 from '../assets/rank-0.png';
import rank1 from '../assets/rank-1.png';
import rank2 from '../assets/rank-2.png';
import rank3 from '../assets/rank-3.png';
import rank4 from '../assets/rank-4.png';

const rankFilters = {
    0: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.28)) drop-shadow(0 0 3px rgba(176, 184, 196, 0.45))',
    1: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 4px rgba(205, 127, 50, 0.42))',
    2: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 4px rgba(59, 130, 246, 0.38))',
    3: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.18)) drop-shadow(0 0 4px rgba(212, 168, 23, 0.38))',
    4: 'drop-shadow(0 1px 1px rgba(15, 23, 42, 0.2)) drop-shadow(0 0 4px rgba(91, 164, 201, 0.38))',
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
