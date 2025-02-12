import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore'; // Import the auth store

const SignupPage = () => {
    const { signup } = useAuthStore(); // Get the signup function from the store
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

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await signup(email, password, firstName, lastName); // Call the signup function from the store
            navigate('/'); // Redirect to homepage on successful signup
        } catch (err) {
            setError('Error creating account'); // Handle signup error
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container is-fluid">
            <div className="columns is-centered">
                <div className="column is-half">
                    <div className="box">
                        <h2 className="title is-4 has-text-centered">Sign Up</h2>
                        {error && <p className="has-text-danger">{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <div className="field">
                                <label className="label">First Name</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Last Name</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
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
                                <label className="label">Confirm Password</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <div className="control">
                                    <button
                                        className={`button is-primary is-fullwidth ${loading ? 'is-loading' : ''}`}
                                        type="submit"
                                        disabled={loading}
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
