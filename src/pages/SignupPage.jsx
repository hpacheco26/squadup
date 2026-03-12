import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const SignupPage = () => {
    const { signup } = useAuthStore();
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
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await signup(email, password, firstName, lastName);
            navigate('/');
        } catch (err) {
            const code = err?.code || '';
            if (code === 'auth/weak-password') {
                setError('Password should be at least 6 characters');
            } else if (code === 'auth/email-already-in-use') {
                setError('Email is already in use');
            } else if (code === 'auth/invalid-email') {
                setError('Invalid email address');
            } else {
                setError('Error creating account');
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
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Create Account</h1>
            </header>

            {/* Form */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {error && <p style={{ color: '#e07070', marginBottom: '12px' }}>{error}</p>}

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        First Name
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Last Name
                    </label>
                    <input
                        className="input"
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Email
                    </label>
                    <input
                        className="input"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Password
                    </label>
                    <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Confirm Password
                    </label>
                    <input
                        className="input"
                        type="password"
                        placeholder="Confirm Password"
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
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '12px', color: '#64748b' }}>
                    Already have an account? <a href="/login" style={{ color: '#5b7bb3' }}>Login</a>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
