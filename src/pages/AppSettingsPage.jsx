import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { User, Globe } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import CreateGroupModal from '../components/modals/GroupModal';
import GroupService from '../api/groupService';

function AppSettingsPage() {
    const { user, playerData, updateUser, logout } = useAuthStore();
    const { lang, setLang, t } = useLanguageStore();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState(playerData?.firstName || '');
    const [lastName, setLastName] = useState(playerData?.lastName || '');
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [canCreate, setCanCreate] = useState(false);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (user?.uid) {
            GroupService.canCreateGroup(user.uid).then(setCanCreate);
        }
    }, [user?.uid]);

    const saveProfile = useCallback(() => {
        updateUser({ firstName, lastName });
    }, [firstName, lastName, updateUser]);

    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateUser({ firstName: e.target.value, lastName });
        }, 800);
    };

    const handleLastNameChange = (e) => {
        setLastName(e.target.value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            updateUser({ firstName, lastName: e.target.value });
        }, 800);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
            }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                    <IoIosArrowBack size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={18} color="#5b7bb3" />
                    <h1 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                        {t('myProfile')}
                    </h1>
                </div>

                <div style={{ width: '34px' }} />
            </header>

            {/* Form */}
            <div style={{ flex: 1, padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        {t('firstName')}
                    </label>
                    <input
                        className="input"
                        type="text"
                        value={firstName}
                        onChange={handleFirstNameChange}
                        onBlur={saveProfile}
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        {t('lastName')}
                    </label>
                    <input
                        className="input"
                        type="text"
                        value={lastName}
                        onChange={handleLastNameChange}
                        onBlur={saveProfile}
                        style={{ borderRadius: '8px' }}
                    />
                </div>
            </div>

            {/* Create Group */}
            {canCreate && (
                <div style={{ padding: '0 20px 20px' }}>
                    <button
                        onClick={() => setIsGroupModalOpen(true)}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#5b7bb3',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            cursor: 'pointer',
                        }}
                    >
                        {t('createGroup')}
                    </button>
                    <CreateGroupModal isOpen={isGroupModalOpen} setIsOpen={setIsGroupModalOpen} />
                </div>
            )}

            {/* Language Switcher */}
            <div style={{ padding: '0 20px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Globe size={14} color="#64748b" />
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        {t('language')}
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontWeight: lang === 'en' ? 'bold' : 'normal',
                            background: lang === 'en' ? '#5b7bb3' : '#f0f2f5',
                            color: lang === 'en' ? '#fff' : '#64748b',
                            fontSize: '0.9rem',
                        }}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLang('pt')}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            fontWeight: lang === 'pt' ? 'bold' : 'normal',
                            background: lang === 'pt' ? '#5b7bb3' : '#f0f2f5',
                            color: lang === 'pt' ? '#fff' : '#64748b',
                            fontSize: '0.9rem',
                        }}
                    >
                        Português
                    </button>
                </div>
            </div>

            {/* Logout at bottom */}
            <div style={{ padding: '20px' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#e07070',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                    }}
                >
                    {t('logout')}
                </button>
            </div>
        </div>
    );
}

export default AppSettingsPage;
