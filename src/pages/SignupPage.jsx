import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
    const { signup } = useAuthStore();
    const { t } = useLanguageStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const submitting = React.useRef(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError(t('passwordsNoMatch'));
            submitting.current = false;
            setLoading(false);
            return;
        }

        try {
            await signup(email, password, firstName, lastName);
            const returnTo = sessionStorage.getItem('returnTo');
            sessionStorage.removeItem('returnTo');
            navigate(returnTo || '/');
        } catch (err) {
            const code = err?.code || '';
            if (code === 'auth/weak-password') {
                setError(t('passwordTooShort'));
            } else if (code === 'auth/email-already-in-use') {
                setError(t('emailInUse'));
            } else if (code === 'auth/invalid-email') {
                setError(t('invalidEmail'));
            } else if (code === 'auth/account-exists-with-different-credential') {
                setError(t('accountExistsDifferentProvider'));
            } else {
                setError(t('errorCreatingAccount'));
            }
        } finally {
            submitting.current = false;
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: 'var(--c-surface)',
                borderBottom: '1px solid var(--c-border)',
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--c-text)' }}>{t('createAccount')}</h1>
            </header>

            {/* Form */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {error && <p style={{ color: '#e07070', marginBottom: '12px' }}>{error}</p>}

                <div style={{ marginBottom: '16px' }}>
                    <label className="auth-label">{t('firstName')}</label>
                    <div className="auth-field">
                        <span className="auth-field-icon"><User size={16} /></span>
                        <input className="auth-input" type="text" placeholder={t('firstName')}
                            value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="auth-label">{t('lastName')}</label>
                    <div className="auth-field">
                        <span className="auth-field-icon"><User size={16} /></span>
                        <input className="auth-input" type="text" placeholder={t('lastName')}
                            value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="auth-label">{t('email')}</label>
                    <div className="auth-field">
                        <span className="auth-field-icon"><Mail size={16} /></span>
                        <input className="auth-input" type="email" placeholder={t('email')}
                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="auth-label">{t('password')}</label>
                    <div className="auth-field">
                        <span className="auth-field-icon"><Lock size={16} /></span>
                        <input className="auth-input has-toggle" type={showPassword ? 'text' : 'password'}
                            placeholder={t('password')} value={password}
                            onChange={(e) => setPassword(e.target.value)} required />
                        <button type="button" className="auth-field-toggle" onClick={() => setShowPassword(v => !v)}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="auth-label">{t('confirmPassword')}</label>
                    <div className="auth-field">
                        <span className="auth-field-icon"><Lock size={16} /></span>
                        <input className="auth-input has-toggle" type={showConfirm ? 'text' : 'password'}
                            placeholder={t('confirmPassword')} value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <button type="button" className="auth-field-toggle" onClick={() => setShowConfirm(v => !v)}>
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom */}
            <div style={{ padding: '20px', borderTop: '1px solid var(--c-border)', backgroundColor: 'var(--c-surface)' }}>
                <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ width: '100%', background: 'var(--c-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', padding: '12px', fontSize: '1rem', cursor: 'pointer' }}
                >
                    {loading ? t('signingUp') : t('signUp')}
                </button>
                <p style={{ textAlign: 'center', marginTop: '12px', color: 'var(--c-text-secondary)' }}>
                    {t('hasAccount')} <a href="/login" style={{ color: 'var(--c-primary)' }}>{t('loginLink')}</a>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
