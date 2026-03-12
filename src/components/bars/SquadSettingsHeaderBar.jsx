import React from 'react';
import { IoIosArrowBack } from "react-icons/io";
import { Users } from 'lucide-react';

const SquadSettingsHeaderBar = ({ group, navigate }) => {
    const playerCount = group?.players?.length || 0;

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
        }}>
            <button onClick={() => navigate(`/groups/${group.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                <IoIosArrowBack size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#5b7bb3" />
                <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {group?.name || 'Settings'}
                </h1>
                {playerCount > 0 && (
                    <span style={{ fontSize: '0.6rem', fontWeight: '600', color: '#64748b', background: '#f1f5f9', borderRadius: '10px', padding: '2px 7px' }}>
                        {playerCount}
                    </span>
                )}
            </div>

            {/* Spacer for symmetry */}
            <div style={{ width: '34px' }} />
        </header>
    );
};

export default SquadSettingsHeaderBar;
