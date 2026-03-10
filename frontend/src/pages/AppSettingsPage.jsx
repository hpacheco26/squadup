import React, { useState } from 'react';
import useAuthStore from '../store/authStore'; // Import auth store
import { useNavigate } from 'react-router-dom';

function AppSettingsPage() {
    const { user, playerData, updateUser, logout } = useAuthStore();
    const navigate = useNavigate();

    // Local state for form fields
    const [firstName, setFirstName] = useState(playerData?.firstName || '');
    const [lastName, setLastName] = useState(playerData?.lastName || '');

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        updateUser({ firstName, lastName }); // Update user details
        navigate('/'); // Redirect back home
    };

    return (
        <div className="container">
            <h1 className="title">Account Settings</h1>
            <form onSubmit={handleSubmit} className="box">
                <div className="field">
                    <label className="label">First Name</label>
                    <div className="control">
                        <input 
                            type="text" 
                            className="input" 
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
                            type="text" 
                            className="input" 
                            value={lastName} 
                            onChange={(e) => setLastName(e.target.value)} 
                            required 
                        />
                    </div>
                </div>

                <div className="buttons">
                    <button type="submit" className="button is-primary">Save</button>
                    <button type="button" className="button is-light" onClick={() => navigate('/')}>
                        Cancel
                    </button>
                </div>
            </form>

            {/* Logout Button Positioned at Bottom */}
            <button 
                onClick={logout} 
                className="button is-danger"
            >
                 Logout
            </button>

            
        </div>
    );
}

export default AppSettingsPage;
