import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { User, Globe, Shield, Trash2, FileText, Scale, Code, Bell } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import useNotificationStore from '../store/notificationStore';
import CreateGroupModal from '../components/modals/GroupModal';
import GroupService from '../api/groupService';

function AppSettingsPage() {
    const { user, playerData, updateUser, logout, deleteAccount } = useAuthStore();
    const { lang, setLang, t } = useLanguageStore();
    const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled, requestPermission, permission } = useNotificationStore();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState(playerData?.firstName || '');
    const [lastName, setLastName] = useState(playerData?.lastName || '');
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [canCreate, setCanCreate] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
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

    const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

    const handleDeleteAccount = async () => {
        if (!isGoogleUser && !deletePassword) return;
        setDeleteLoading(true);
        setDeleteError('');
        try {
            await deleteAccount(isGoogleUser ? null : deletePassword);
            navigate('/login');
        } catch {
            setDeleteError(t('deleteAccountError'));
            setDeleteLoading(false);
        }
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

            {/* Notifications */}
            <div style={{ padding: '0 20px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Bell size={14} color="#64748b" />
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        {t('notifications')}
                    </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', background: '#f0f2f5' }}>
                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                        {t('pushNotifications')}
                    </span>
                    <button
                        onClick={async () => {
                            if (!notificationsEnabled) {
                                const result = await requestPermission(user?.uid);
                                if (result === 'granted') setNotificationsEnabled(true, user?.uid);
                            } else {
                                setNotificationsEnabled(false);
                            }
                        }}
                        style={{
                            width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                            background: notificationsEnabled ? '#5b7bb3' : '#cbd5e1',
                            position: 'relative', transition: 'background 0.2s',
                        }}
                    >
                        <span style={{
                            display: 'block', width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: '3px', transition: 'left 0.2s',
                            left: notificationsEnabled ? '25px' : '3px',
                        }} />
                    </button>
                </div>
                {permission === 'denied' && (
                    <p style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '6px' }}>
                        {t('notificationsDenied')}
                    </p>
                )}
            </div>

            {/* Legal Section */}
            <div style={{ padding: '0 20px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Scale size={14} color="#64748b" />
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        {t('legal')}
                    </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button onClick={() => navigate('/privacy')} style={linkBtnStyle}>
                        <Shield size={16} color="#5b7bb3" /> {t('privacyPolicy')}
                    </button>
                    <button onClick={() => navigate('/terms')} style={linkBtnStyle}>
                        <FileText size={16} color="#5b7bb3" /> {t('termsOfService')}
                    </button>
                    <button onClick={() => navigate('/licenses')} style={linkBtnStyle}>
                        <Code size={16} color="#5b7bb3" /> {t('openSourceLicenses')}
                    </button>
                </div>
            </div>

            {/* Delete Account */}
            <div style={{ padding: '0 20px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trash2 size={14} color="#64748b" />
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>
                        {t('account')}
                    </label>
                </div>
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                            width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #fca5a5',
                            background: '#fff', color: '#dc2626', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer',
                        }}
                    >
                        {t('deleteAccount')}
                    </button>
                ) : (
                    <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '14px', border: '1px solid #fca5a5' }}>
                        <p style={{ fontSize: '0.85rem', color: '#991b1b', marginBottom: '10px', lineHeight: '1.5' }}>
                            {t('deleteAccountConfirm')}
                        </p>
                        {!isGoogleUser && (
                            <input
                                type="password"
                                className="input"
                                placeholder={t('deleteAccountPasswordPrompt')}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                style={{ borderRadius: '6px', marginBottom: '10px', fontSize: '0.9rem' }}
                            />
                        )}
                        {deleteError && (
                            <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '8px' }}>{deleteError}</p>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}
                                style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || (!isGoogleUser && !deletePassword)}
                                style={{
                                    flex: 1, padding: '10px', borderRadius: '6px', border: 'none',
                                    background: deleteLoading ? '#fca5a5' : '#dc2626', color: '#fff',
                                    fontSize: '0.9rem', fontWeight: '600', cursor: deleteLoading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {deleteLoading ? t('deleting') : t('deleteAccount')}
                            </button>
                        </div>
                    </div>
                )}
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

const linkBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: 'none', background: '#f0f2f5', color: '#334155',
    fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', textAlign: 'left',
};

export default AppSettingsPage;
