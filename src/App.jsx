import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/bars/NavBar.jsx';
import HomePage from './pages/HomePage.jsx';

import GroupPage from './pages/GroupPage';
import SquadSettingsPage from './pages/SquadSettingsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PregamePage from './pages/PreGamePage';
import GamePage from './pages/GamePage';
import TeamsPage from './pages/TeamsPage';
import RankPage from './pages/RankPage.jsx';
import AppSettingsPage from './pages/AppSettingsPage.jsx';
import JoinPage from './pages/JoinPage.jsx';
import GameInvitePage from './pages/GameInvitePage.jsx';
import PaymentsPage from './pages/PaymentsPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';


function App() {


  const appStyles = {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  return (
    <div style={appStyles}>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

        <Route path="/groups/:id" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
        <Route path="/groups/:id/settings" element={<ProtectedRoute><SquadSettingsPage /></ProtectedRoute>} /> 

        <Route path="/pregame/:gameId" element={<ProtectedRoute><PregamePage /></ProtectedRoute>} />
        <Route path="/teams/:gameId" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
        <Route path="/payments/:groupId" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/game/:gameId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/rank" element={<ProtectedRoute><RankPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppSettingsPage /></ProtectedRoute>} />
        <Route path="/join/:code" element={<ProtectedRoute><JoinPage /></ProtectedRoute>} />
        <Route path="/game-invite/:gameId" element={<GameInvitePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
      <NavBar />
    </div>
  );
}

export default App;
