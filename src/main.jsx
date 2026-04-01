import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import App from './App.jsx';
import useAuthStore from './store/authStore';
import 'bulma/css/bulma.min.css';
import './index.css';

// Initialize Firebase auth state listener
useAuthStore.getState().initializeAuth();

// Native platform setup
if (Capacitor.isNativePlatform()) {
  // Style the status bar
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#5b7bb3' }).catch(() => {});

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
