import axios from 'axios';
import { auth } from '../../../firebase/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Wait for Firebase auth to initialize
const waitForAuth = () => {
    return new Promise((resolve) => {
        if (auth.currentUser) return resolve(auth.currentUser);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
};

// Attach Firebase ID token to every request
api.interceptors.request.use(async (config) => {
    const user = await waitForAuth();
    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
