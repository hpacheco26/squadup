import RankIcon from './RankIcon';

const RankTierList = () => {
    const tiers = [0, 1, 2, 3, 4];

    return (
        <div
            style={{
                padding: '0 2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                overflowX: 'auto',
            }}
        >
            {tiers.map((tier) => (
                <div
                    key={tier}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flexShrink: 0,
                    }}
                >
                    <RankIcon rank={tier} size={30} />
                </div>
            ))}
        </div>
    );
};

export default RankTierList;
