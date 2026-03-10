import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import { FiSave } from 'react-icons/fi';
import useAuthStore from '../store/authStore';

function AppSettingsPage() {
    const { user, playerData, updateUser, logout } = useAuthStore();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState(playerData?.firstName || '');
    const [lastName, setLastName] = useState(playerData?.lastName || '');

    const handleSave = () => {
        updateUser({ firstName, lastName });
        navigate('/');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f2f5' }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
            }}>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }}>
                    <IoIosArrowBack size={24} />
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Settings</h1>
                <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center' }} aria-label="Save">
                    <FiSave size={24} />
                </button>
            </header>

            {/* Form */}
            <div style={{ flex: 1, padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        First Name
                    </label>
                    <input
                        className="input"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                        Last Name
                    </label>
                    <input
                        className="input"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={{ borderRadius: '8px' }}
                    />
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
                    Logout
                </button>
            </div>
        </div>
    );
}

export default AppSettingsPage;
