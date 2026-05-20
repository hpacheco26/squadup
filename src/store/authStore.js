import { create } from 'zustand';
import { auth } from '../config/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup
} from 'firebase/auth';
import PlayerService from '../api/playerService';
import GroupService from '../api/groupService';

const googleProvider = new GoogleAuthProvider();

const serializeUser = (user) => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
});

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null, // Persisted user
    playerData: JSON.parse(localStorage.getItem('playerData')) || null, // Persisted player
    selectedGroupId: localStorage.getItem('selectedGroupId') || null, // Persisted group selection

    // 🔹 Set the currently selected group (for header switcher / navbar context)
    setSelectedGroupId: (groupId) => {
        set({ selectedGroupId: groupId || null });
        if (groupId) localStorage.setItem('selectedGroupId', groupId);
        else localStorage.removeItem('selectedGroupId');
    },

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
                const serialized = serializeUser(user);
                set({ user: serialized });
                localStorage.setItem('user', JSON.stringify(serialized));
                await useAuthStore.getState().fetchPlayerData(user.uid);
            } else {
                set({ user: null, playerData: null, selectedGroupId: null });
                localStorage.removeItem('user');
                localStorage.removeItem('playerData');
                localStorage.removeItem('selectedGroupId');
            }
        });
    },

    // 🔹 Login with email/password
    login: async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const serialized = serializeUser(user);
        set({ user: serialized });
        localStorage.setItem('user', JSON.stringify(serialized));
        await useAuthStore.getState().fetchPlayerData(user.uid);
    },

    // 🔹 Login with Google
    loginWithGoogle: async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const serialized = serializeUser(user);
        set({ user: serialized });
        localStorage.setItem('user', JSON.stringify(serialized));

        const playerExists = await PlayerService.checkPlayerExists(user.uid);

        if (!playerExists) {
            const displayName = user.displayName || '';
            const parts = displayName.trim().split(' ');
            const playerData = {
                id: `${displayName.replaceAll(' ', '.') || user.uid}-${user.uid}`,
                firstName: parts[0] || '',
                lastName: parts.slice(1).join(' ') || '',
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
    },

    // 🔹 Signup function (also creates a player)
    signup: async (email, password, firstName, lastName) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Guard: only create a player doc if one doesn't already exist for this uid
            const playerExists = await PlayerService.checkPlayerExists(user.uid);
            if (!playerExists) {
                const playerData = {
                    id: `${firstName}.${lastName}-${user.uid}`,
                    firstName,
                    lastName,
                    userId: user.uid,
                    groups: []
                };

                await PlayerService.createPlayer(playerData);
                set({ user, playerData });
                localStorage.setItem('playerData', JSON.stringify(playerData));
            } else {
                const playerData = await PlayerService.getPlayerByUserId(user.uid);
                set({ user, playerData });
                localStorage.setItem('playerData', JSON.stringify(playerData));
            }

            const serialized = serializeUser(user);
            localStorage.setItem('user', JSON.stringify(serialized));
            set((state) => ({ ...state, user: serialized }));
        } catch (error) {
            console.error("Signup Error:", error);
            throw error;
        }
    },

    // 🔹 Logout function
    logout: async () => {
        try {
            await signOut(auth);
            set({ user: null, playerData: null, selectedGroupId: null });
            localStorage.removeItem('user');
            localStorage.removeItem('playerData');
            localStorage.removeItem('selectedGroupId');
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

    // 🔹 Delete account and all user data
    deleteAccount: async (password) => {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error('No user signed in');

            // Re-authenticate before deletion
            const providerId = user.providerData[0]?.providerId;
            if (providerId === 'google.com') {
                await reauthenticateWithPopup(user, googleProvider);
            } else if (password) {
                const credential = EmailAuthProvider.credential(user.email, password);
                await reauthenticateWithCredential(user, credential);
            } else {
                throw new Error('Password required for email accounts');
            }

            const { playerData } = useAuthStore.getState();

            // Remove player from all groups
            if (playerData) {
                const groups = await GroupService.getGroupsByPlayer(playerData.id);
                for (const group of groups) {
                    const updatedPlayers = group.players.filter(p => p.id !== playerData.id);
                    await GroupService.updateGroup(group.id, { players: updatedPlayers });
                }
                // Delete the player document
                await PlayerService.deletePlayer(playerData.id);
            }

            // Delete the Firebase Auth account
            await deleteUser(user);

            // Clear local state
            set({ user: null, playerData: null, selectedGroupId: null });
            localStorage.removeItem('user');
            localStorage.removeItem('playerData');
            localStorage.removeItem('selectedGroupId');
        } catch (error) {
            console.error("Delete Account Error:", error);
            throw error;
        }
    },

    // 🔹 Check if the current user can join/create one more group
    canJoinMoreGroups: async () => {
        const { playerData } = useAuthStore.getState();
        if (!playerData) return false;
        const paidSlots = playerData.paidGroupSlots || 0;
        const groups = await GroupService.getGroupsByPlayer(playerData.id);
        return groups.length < 1 + paidSlots;
    },

    // 🔹 Grant one extra group slot (stub — wire to real IAP before release)
    purchaseGroupSlot: async () => {
        const { playerData } = useAuthStore.getState();
        if (!playerData) return false;
        try {
            const newSlots = (playerData.paidGroupSlots || 0) + 1;
            await PlayerService.updatePlayer(playerData.id, { paidGroupSlots: newSlots });
            const updated = { ...playerData, paidGroupSlots: newSlots };
            set({ playerData: updated });
            localStorage.setItem('playerData', JSON.stringify(updated));
            return true;
        } catch (err) {
            console.error('purchaseGroupSlot error:', err);
            return false;
        }
    },
}));

export default useAuthStore;
