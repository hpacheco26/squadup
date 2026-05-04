import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useLanguageStore from '../store/languageStore';
import { FaGoogle } from 'react-icons/fa';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';

const LoginPage = () => {
    const { login, loginWithGoogle } = useAuthStore();
    const { t } = useLanguageStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            const returnTo = sessionStorage.getItem('returnTo');
            sessionStorage.removeItem('returnTo');
            navigate(returnTo || '/'); // Redirect to saved page or homepage
        } catch (err) {
            setError(t('invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            const returnTo = sessionStorage.getItem('returnTo');
            sessionStorage.removeItem('returnTo');
            navigate(returnTo || '/'); // Redirect after Google login
        } catch (err) {
            setError('Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container is-fluid" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%' }}>
            <div className="columns is-centered" style={{ width: '100%' }}>
                <div className="column is-half">
                    <div className="box" style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <img src={logo} alt="SquadUp" className="logo-themed" style={{ height: '48px' }} />
                        </div>
                        {error && <p className="has-text-danger" style={{ marginBottom: 12 }}>{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label className="auth-label">{t('email')}</label>
                                <div className="auth-field">
                                    <span className="auth-field-icon"><Mail size={16} /></span>
                                    <input
                                        className="auth-input"
                                        type="email"
                                        placeholder={t('email')}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div style={{ marginBottom: 20 }}>
                                <label className="auth-label">{t('password')}</label>
                                <div className="auth-field">
                                    <span className="auth-field-icon"><Lock size={16} /></span>
                                    <input
                                        className="auth-input has-toggle"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={t('password')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button type="button" className="auth-field-toggle" onClick={() => setShowPassword(v => !v)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <button
                                        className={`button is-fullwidth btn-primary ${loading ? 'is-loading' : ''}`}
                                        type="submit"
                                        disabled={loading}
                                        style={{ background: 'var(--c-primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        {t('login')}
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Google Login Button */}
                        <div className="field mt-4">
                            <div className="control">
                                <button
                                    className="button is-fullwidth"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    style={{ cursor: 'pointer', background: 'var(--c-surface-alt)', color: 'var(--c-text)', border: '1px solid var(--c-border)' }}
                                >
                                    <span className="icon">
                                        <FaGoogle />
                                    </span>
                                    <span>{t('loginWithGoogle')}</span>
                                </button>
                            </div>
                        </div>

                        <p className="has-text-centered">
                            {t('noAccount')} <a href="/signup">{t('signUpLink')}</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
