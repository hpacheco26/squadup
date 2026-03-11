import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore'; // Import the auth store
import { FaGoogle } from 'react-icons/fa'; // Google icon
import logo from '../assets/logo.png';

const LoginPage = () => {
    const { login, loginWithGoogle } = useAuthStore(); // Get auth functions from the store
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
            setError('Invalid credentials');
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
                    <div className="box">
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <img src={logo} alt="SquadUp" style={{ height: '48px' }} />
                        </div>
                        {error && <p className="has-text-danger">{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className="field">
                                <label className="label">Email</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Password</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <button
                                        className={`button is-fullwidth ${loading ? 'is-loading' : ''}`}
                                        type="submit"
                                        disabled={loading}
                                        style={{ background: '#5b7bb3', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Google Login Button */}
                        <div className="field mt-4">
                            <div className="control">
                                <button
                                    className="button is-light is-fullwidth"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span className="icon">
                                        <FaGoogle />
                                    </span>
                                    <span>Login with Google</span>
                                </button>
                            </div>
                        </div>

                        <p className="has-text-centered">
                            Don't have an account? <a href="/signup">Sign up</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
