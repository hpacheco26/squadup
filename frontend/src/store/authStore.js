import { create } from 'zustand';
import { auth } from '../../../firebase/firebase-config';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup 
} from 'firebase/auth';
import PlayerService from '../api/playerService';

const googleProvider = new GoogleAuthProvider();

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null, // Persisted user
    playerData: JSON.parse(localStorage.getItem('playerData')) || null, // Persisted player

    // 🔹 Fetch player data from Firestore
    fetchPlayerData: async (userId) => {
        try {
            const player = await PlayerService.getPlayerByUserId(userId);
            if (player) {
                set({ playerData: player });
                localStorage.setItem('playerData', JSON.stringify(player)); // Persist player data
            }
        } catch (error) {
            console.error("Error fetching player data:", error);
        }
    },

    // 🔹 Listen for auth state changes
    initializeAuth: () => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                set({ user });
                localStorage.setItem('user', JSON.stringify(user));
                await useAuthStore.getState().fetchPlayerData(user.uid);
            } else {
                set({ user: null, playerData: null });
                localStorage.removeItem('user');
                localStorage.removeItem('playerData');
            }
        });
    },

    // 🔹 Login with email/password
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            set({ user });
            localStorage.setItem('user', JSON.stringify(user));

            await useAuthStore.getState().fetchPlayerData(user.uid);
        } catch (error) {
            console.error("Login Error:", error);
        }
    },

    // 🔹 Login with Google
    loginWithGoogle: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            set({ user });
            localStorage.setItem('user', JSON.stringify(user));

            const playerExists = await PlayerService.checkPlayerExists(user.uid);

            if (!playerExists) {
                const playerData = {
                    id: `${user.displayName.replaceAll(' ', '.')}-${user.uid}`,
                    firstName: user.displayName?.split(" ")[0] || "",
                    lastName: user.displayName?.split(" ")[1] || "",
                    userId: user.uid,
                    groups: []
                };

                await PlayerService.createPlayer(playerData);
                set({ playerData });
                localStorage.setItem('playerData', JSON.stringify(playerData));
            } else {
                const player = await PlayerService.getPlayerByUserId(user.uid);
                set({ playerData: player });
                localStorage.setItem('playerData', JSON.stringify(player));
            }
        } catch (error) {
            console.error("Google Login Error:", error);
        }
    },

    // 🔹 Signup function (also creates a player)
    signup: async (email, password, firstName, lastName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create player in Firestore
            const playerData = {
                id: `${firstName}.${lastName}-${user.uid}`,
                firstName,
                lastName,
                userId: user.uid,
                groups: []
            };

            await PlayerService.createPlayer(playerData);

            // Update Zustand store
            set({ user, playerData });
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('playerData', JSON.stringify(playerData));
        } catch (error) {
            console.error("Signup Error:", error);
        }
    },

    // 🔹 Logout function
    logout: async () => {
        try {
            await signOut(auth);
            set({ user: null, playerData: null });
            localStorage.removeItem('user');
            localStorage.removeItem('playerData');
        } catch (error) {
            console.error("Logout Error:", error);
        }
    },

    // 🔹 Update user profile (first/last name)
    updateUser: async (updates) => {
        try {
            const { playerData } = useAuthStore.getState();
            if (!playerData) return;

            const updatedPlayer = { ...playerData, ...updates };
            await PlayerService.updatePlayer(playerData.id, updates);

            set({ playerData: updatedPlayer });
            localStorage.setItem('playerData', JSON.stringify(updatedPlayer));
        } catch (error) {
            console.error("Update User Error:", error);
        }
    },
}));

export default useAuthStore;
