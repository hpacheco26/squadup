import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';

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
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password !== confirmPassword) {
            setError(t('passwordsNoMatch'));
            setLoading(false);
            return;
        }

        try {
            await signup(email, password, firstName, lastName);
            navigate('/');
        } catch (err) {
            const code = err?.code || '';
            if (code === 'auth/weak-password') {
                setError(t('passwordTooShort'));
            } else if (code === 'auth/email-already-in-use') {
                setError(t('emailInUse'));
            } else if (code === 'auth/invalid-email') {
                setError(t('invalidEmail'));
            } else {
                setError(t('errorCreatingAccount'));
            }
        } finally {
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
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('createAccount')}</h1>
            </header>

            {/* Form */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {error && <p style={{ color: '#e07070', marginBottom: '12px' }}>{error}</p>}

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        {t('firstName')}
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder={t('firstName')}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        {t('lastName')}
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder={t('lastName')}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        {t('email')}
                    </label>
                    <input
                        className="input"
                        type="email"
                        placeholder={t('email')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        {t('password')}
                    </label>
                    <input
                        className="input"
                        type="password"
                        placeholder={t('password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        {t('confirmPassword')}
                    </label>
                    <input
                        className="input"
                        type="password"
                        placeholder={t('confirmPassword')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>
            </div>

            {/* Fixed Bottom */}
            <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ width: '100%', background: '#5b7bb3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', padding: '12px', fontSize: '1rem', cursor: 'pointer' }}
                >
                    {loading ? t('signingUp') : t('signUp')}
                </button>
                <p style={{ textAlign: 'center', marginTop: '12px', color: '#64748b' }}>
                    {t('hasAccount')} <a href="/login" style={{ color: '#5b7bb3' }}>{t('loginLink')}</a>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
