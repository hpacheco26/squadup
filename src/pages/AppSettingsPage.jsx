import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Shield, Trash2, FileText, Code, LogOut,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import useNotificationStore from '../store/notificationStore';
import AppHeaderBar from '../components/bars/AppHeaderBar';
import {
    SectionLabel, SettingsGroup, SettingsRow, settingsInputStyle,
    SettingsToggle, SettingsSegmented,
} from '../components/lists/SettingsList';

function AppSettingsPage() {
    const { user, playerData, updateUser, logout, deleteAccount } = useAuthStore();
    const { lang, setLang, t } = useLanguageStore();
    const { enabled: notificationsEnabled, setEnabled: setNotificationsEnabled, requestPermission, permission } = useNotificationStore();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState(playerData?.firstName || '');
    const [lastName, setLastName] = useState(playerData?.lastName || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const debounceRef = useRef(null);

    const debouncedSave = (next) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => updateUser(next), 800);
    };

    const handleFirstNameChange = (e) => {
        setFirstName(e.target.value);
        debouncedSave({ firstName: e.target.value, lastName });
    };

    const handleLastNameChange = (e) => {
        setLastName(e.target.value);
        debouncedSave({ firstName, lastName: e.target.value });
    };

    const handleLogout = () => { logout(); navigate('/login'); };

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

    const handleToggleNotifications = async (next) => {
        if (next) {
            const result = await requestPermission(user?.uid);
            if (result === 'granted') setNotificationsEnabled(true, user?.uid);
        } else {
            setNotificationsEnabled(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppHeaderBar variant="logo" onBack={() => navigate('/')} />

            <div style={{ padding: '20px 16px 32px', maxWidth: 640, margin: '0 auto', width: '100%' }}>

                {/* PROFILE */}
                <SectionLabel>{t('myProfile')}</SectionLabel>
                <SettingsGroup>
                    <SettingsRow label={t('firstName')} chevron={false}>
                        <input
                            type="text"
                            value={firstName}
                            onChange={handleFirstNameChange}
                            style={settingsInputStyle}
                        />
                    </SettingsRow>
                    <SettingsRow label={t('lastName')} chevron={false} last>
                        <input
                            type="text"
                            value={lastName}
                            onChange={handleLastNameChange}
                            style={settingsInputStyle}
                        />
                    </SettingsRow>
                </SettingsGroup>

                {/* PREFERENCES */}
                <SectionLabel>{t('preferences') || 'Preferences'}</SectionLabel>
                <SettingsGroup footer={permission === 'denied' ? t('notificationsDenied') : undefined}>
                    <SettingsRow label={t('language')} chevron={false}>
                        <SettingsSegmented
                            value={lang}
                            onChange={setLang}
                            options={[{ value: 'en', label: 'EN' }, { value: 'pt', label: 'PT' }]}
                        />
                    </SettingsRow>
                    <SettingsRow label={t('pushNotifications')} chevron={false} last>
                        <SettingsToggle value={notificationsEnabled} onChange={handleToggleNotifications} />
                    </SettingsRow>
                </SettingsGroup>

                {/* LEGAL */}
                <SectionLabel>{t('legal')}</SectionLabel>
                <SettingsGroup>
                    <SettingsRow label={t('privacyPolicy')} icon={Shield} onClick={() => navigate('/privacy')} />
                    <SettingsRow label={t('termsOfService')} icon={FileText} onClick={() => navigate('/terms')} />
                    <SettingsRow label={t('openSourceLicenses')} icon={Code} onClick={() => navigate('/licenses')} last />
                </SettingsGroup>

                {/* ACCOUNT */}
                <SectionLabel>{t('account')}</SectionLabel>
                <SettingsGroup>
                    <SettingsRow label={t('logout')} icon={LogOut} danger onClick={handleLogout} chevron={false} />
                    <SettingsRow
                        label={t('deleteAccount')}
                        icon={Trash2}
                        danger
                        onClick={() => setShowDeleteConfirm(v => !v)}
                        chevron={false}
                        last
                    />
                </SettingsGroup>

                {showDeleteConfirm && (
                    <div style={{ background: '#fef2f2', borderRadius: 14, padding: 14, border: '1px solid #fca5a5', marginTop: -16, marginBottom: 24 }}>
                        <p style={{ fontSize: '0.85rem', color: '#991b1b', margin: '0 0 10px', lineHeight: 1.5 }}>
                            {t('deleteAccountConfirm')}
                        </p>
                        {!isGoogleUser && (
                            <input
                                type="password"
                                placeholder={t('deleteAccountPasswordPrompt')}
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 10px', borderRadius: 6,
                                    border: '1px solid #fca5a5', marginBottom: 10, fontSize: '0.9rem',
                                    background: '#fff',
                                }}
                            />
                        )}
                        {deleteError && (
                            <p style={{ color: '#dc2626', fontSize: '0.8rem', margin: '0 0 8px' }}>{deleteError}</p>
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(''); }}
                                style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}
                            >Cancel</button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || (!isGoogleUser && !deletePassword)}
                                style={{
                                    flex: 1, padding: 10, borderRadius: 6, border: 'none',
                                    background: deleteLoading ? '#fca5a5' : '#dc2626', color: '#fff',
                                    fontSize: '0.9rem', fontWeight: 600, cursor: deleteLoading ? 'not-allowed' : 'pointer',
                                }}
                            >{deleteLoading ? t('deleting') : t('deleteAccount')}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AppSettingsPage;
