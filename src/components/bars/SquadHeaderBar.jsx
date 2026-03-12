import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings } from 'react-icons/fi';
import { Users } from 'lucide-react';
import useGroupStore from '../../store/groupStore';
import useLanguageStore from '../../store/languageStore';

const SquadHeaderBar = () => {
    const { group } = useGroupStore();
    const navigate = useNavigate();
    const { t } = useLanguageStore();

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={20} color="#5b7bb3" />
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {group?.name || t('squad')}
                </h1>
                {playerCount > 0 && (
                    <span style={{
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        color: '#64748b',
                        background: '#f1f5f9',
                        borderRadius: '10px',
                        padding: '2px 8px',
                    }}>
                        {playerCount} {t('playersLabel')}
                    </span>
                )}
            </div>
            <button
                onClick={() => group?.id && navigate(`/groups/${group.id}/settings`)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#94a3b8' }}
                aria-label="Go to Group Settings"
            >
                <FiSettings size={22} />
            </button>
        </header>
    );
};

export default SquadHeaderBar;
