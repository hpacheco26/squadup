import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import useAuthStore from './store/authStore';
import 'bulma/css/bulma.min.css';
import './index.css';

// Initialize Firebase auth state listener
useAuthStore.getState().initializeAuth();

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
