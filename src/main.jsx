import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import useAuthStore from './store/authStore';
import 'bulma/css/bulma.min.css';
import './index.css';

// ── Sentry error monitoring ──────────────────────────────────────────────────
// Replace VITE_SENTRY_DSN in your .env file with your project DSN from sentry.io
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
    ],
    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Capture replays only on errors
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0,
  });
}

// Register PWA service worker manually so rejections are caught (e.g. iOS private mode)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
    console.warn('[SW] PWA registration failed:', err);
  });
}

// Initialize Firebase auth state listener
useAuthStore.getState().initializeAuth();

// Native platform setup
if (Capacitor.isNativePlatform()) {
  // Style the status bar
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#125669' }).catch(() => {});

  // Handle hardware back button on Android
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      CapApp.exitApp();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
