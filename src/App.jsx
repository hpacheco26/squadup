import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; 
import HomePage from './pages/HomePage.jsx';
import PlayersPage from './pages/PlayerPage.jsx';
import GroupsPage from './pages/GroupsPage';
import GroupPage from './pages/GroupPage';
import SquadSettingsPage from './pages/SquadSettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PregamePage from './pages/PreGamePage';
import GamePage from './pages/GamePage';
import TeamsPage from './pages/TeamsPage';
import RankPage from './pages/RankPage.jsx';
import AppSettingsPage from './pages/AppSettingsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/bars/NavBar.jsx'; 

function App() {
  const location = useLocation();
  const hideNavbar = ['/login', '/signup'].includes(location.pathname);

  const appStyles = {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f0f2f5',
    overflow: 'hidden',
  };

  return (
    <div style={appStyles}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
        <Route path="/groups/:id" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
        <Route path="/groups/:id/settings" element={<ProtectedRoute><SquadSettingsPage /></ProtectedRoute>} /> 
        <Route path="/players" element={<ProtectedRoute><PlayersPage /></ProtectedRoute>} />
        <Route path="/pregame/:gameId" element={<ProtectedRoute><PregamePage /></ProtectedRoute>} />
        <Route path="/teams/:gameId" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
        <Route path="/game/:gameId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/rank" element={<ProtectedRoute><RankPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppSettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
      {!hideNavbar && <Navbar />}
    </div>
  );
}

export default App;
