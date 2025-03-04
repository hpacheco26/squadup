import React from 'react';
import { Routes, Route } from 'react-router-dom'; 
import HomePage from './pages/HomePage.jsx';
import PlayersPage from './pages/PlayerPage.jsx';
import GroupsPage from './pages/GroupsPage';
import GroupPage from './pages/GroupPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PregamePage from './pages/PreGamePage';
import GamePage from './pages/GamePage';
import RankPage from './pages/RankPage.jsx';
import AppSettingsPage from './pages/AppSettingsPage.jsx'; // Import new settings page
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/NavBar.jsx'; 
import HeaderBar from './components/HeaderBar.jsx';

function App() {
  const appStyles = {
    // padding: '20px',
    height: '100vh', // Ensure page fills the screen
    display: 'flex',
    flexDirection: 'column',
    background: '#e0e2db',
  };

  return (
    <>



      <div style={appStyles}>
      <HeaderBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
          <Route path="/players" element={<ProtectedRoute><PlayersPage /></ProtectedRoute>} />
          <Route path="/pregame/:gameId" element={<ProtectedRoute><PregamePage /></ProtectedRoute>} />
          <Route path="/game/:gameId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
          <Route path="/rank" element={<ProtectedRoute><RankPage /></ProtectedRoute>} />
          
          {/* New Settings Page */}
          <Route path="/settings" element={<ProtectedRoute><AppSettingsPage /></ProtectedRoute>} />
        </Routes>
        <Navbar />
      </div>
    </>
  );
}

export default App;
