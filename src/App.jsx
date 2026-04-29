import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/bars/NavBar.jsx';
import HomePage from './pages/HomePage.jsx';

import GroupPage from './pages/GroupPage';
import SquadSettingsPage from './pages/SquadSettingsPage';
import GameSettingsPage from './pages/GameSettingsPage';
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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';
import LicensesPage from './pages/LicensesPage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import useNotificationStore from './store/notificationStore';


function App() {

  const user = useAuthStore((s) => s.user);
  const { startListening, stopListening, enabled } = useNotificationStore();

  useEffect(() => {
    if (user?.uid && enabled) {
      startListening(user.uid);
    }
    return () => stopListening();
  }, [user?.uid, enabled]);


  const appStyles = {
    height: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    paddingTop: 'var(--sat)',
    paddingBottom: 'var(--sab)',
    paddingLeft: 'var(--sal)',
    paddingRight: 'var(--sar)',
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
        <Route path="/groups/:groupId/games/new" element={<ProtectedRoute><GameSettingsPage /></ProtectedRoute>} />
        <Route path="/games/:gameId/settings" element={<ProtectedRoute><GameSettingsPage /></ProtectedRoute>} />

        <Route path="/pregame" element={<ProtectedRoute><PregamePage /></ProtectedRoute>} />
        <Route path="/pregame/:gameId" element={<ProtectedRoute><PregamePage /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><PregamePage /></ProtectedRoute>} />
        <Route path="/teams/:gameId" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
        <Route path="/payments/:groupId" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><PregamePage /></ProtectedRoute>} />
        <Route path="/game/:gameId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
        <Route path="/rank" element={<ProtectedRoute><RankPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppSettingsPage /></ProtectedRoute>} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/licenses" element={<LicensesPage />} />
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
