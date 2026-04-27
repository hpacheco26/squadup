import React from 'react';

const TEAM_THEMES = {
    left: {
        line: '#0d9488',
        soft: 'rgba(13, 148, 136, 0.12)',
        strong: '#0f766e',
    },
    right: {
        line: '#e11d48',
        soft: 'rgba(225, 29, 72, 0.12)',
        strong: '#be123c',
    },
};

const getTeamStrength = (players = []) => {
    if (players.length === 0) return 0;

    return players.reduce((sum, player) => {
        const rank = Number.isFinite(player?.rank) ? player.rank : Number(player?.rank) || 0;
        return sum + (rank + 1);
    }, 0);
};

const getBalance = (leftStrength, rightStrength) => {
    const stronger = Math.max(leftStrength, rightStrength);
    const weaker = Math.min(leftStrength, rightStrength);
    if (stronger === 0) return 100;
    return Math.max(1, Math.min(100, Math.round((weaker / stronger) * 100)));
};

const getRelativePower = (leftStrength, rightStrength) => {
    const total = leftStrength + rightStrength;
    if (total === 0) {
        return { left: 50, right: 50 };
    }

    const left = Math.round((leftStrength / total) * 100);
    const right = 100 - left;
    return {
        left: Math.max(1, Math.min(99, left)),
        right: Math.max(1, Math.min(99, right)),
    };
};

const getBalanceColor = (balance) => {
    if (balance >= 90) return '#22c55e';
    if (balance >= 75) return '#f59e0b';
    return '#ef4444';
};

const TeamPowerCard = ({ leftTeamName, rightTeamName, leftPlayers, rightPlayers }) => {
    const leftStrength = getTeamStrength(leftPlayers);
    const rightStrength = getTeamStrength(rightPlayers);
    const { left: leftPower, right: rightPower } = getRelativePower(leftStrength, rightStrength);
    const balance = getBalance(leftStrength, rightStrength);
    const balanceColor = getBalanceColor(balance);
    const leftCount = leftPlayers?.length || 0;
    const rightCount = rightPlayers?.length || 0;

    return (
        <div
            style={{
                borderRadius: '16px',
                padding: '8px 10px',
                border: '1px solid #e2e8f0',
                background: 'linear-gradient(90deg, rgba(13,148,136,0.16) 0%, rgba(13,148,136,0.05) 30%, transparent 46%, transparent 54%, rgba(225,29,72,0.05) 70%, rgba(225,29,72,0.16) 100%)',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.05)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', color: TEAM_THEMES.left.strong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {leftTeamName}
                        </span>
                        <span style={{
                            fontSize: '0.56rem',
                            fontWeight: '700',
                            color: TEAM_THEMES.left.strong,
                            background: TEAM_THEMES.left.soft,
                            borderRadius: '999px',
                            padding: '1px 5px',
                            lineHeight: 1.4,
                            flexShrink: 0,
                        }}>
                            {leftCount}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '0.95rem', lineHeight: 1, fontWeight: '800', color: TEAM_THEMES.left.strong }}>
                            {leftPower}
                        </span>
                    </div>
                    <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${leftPower}%`, height: '100%', background: TEAM_THEMES.left.line }} />
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minWidth: '48px',
                }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: '800',
                        fontSize: '0.78rem',
                        letterSpacing: '0.1em',
                        background: 'linear-gradient(135deg, #1e293b, #243244)',
                        border: '1px solid #334155',
                        boxShadow: '0 2px 8px rgba(30,41,59,0.3)',
                    }}>
                        VS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.56rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.08em' }}>
                            EQUILIBRIO
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0, textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', minWidth: 0 }}>
                        <span style={{
                            fontSize: '0.56rem',
                            fontWeight: '700',
                            color: TEAM_THEMES.right.strong,
                            background: TEAM_THEMES.right.soft,
                            borderRadius: '999px',
                            padding: '1px 5px',
                            lineHeight: 1.4,
                            flexShrink: 0,
                        }}>
                            {rightCount}
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '700', color: TEAM_THEMES.right.strong, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {rightTeamName}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: '6px' }}>
                        <span style={{ fontSize: '0.95rem', lineHeight: 1, fontWeight: '800', color: TEAM_THEMES.right.strong }}>
                            {rightPower}
                        </span>
                    </div>
                    <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${rightPower}%`, height: '100%', marginLeft: 'auto', background: TEAM_THEMES.right.line }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPowerCard;
