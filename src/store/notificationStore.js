import { create } from 'zustand';
import { getToken } from 'firebase/messaging';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getMessagingInstance } from '../config/firebase';
import NotificationService from '../api/notificationService';

const VAPID_KEY = null; // Will be set after generating in Firebase Console

const useNotificationStore = create((set, get) => ({
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    enabled: JSON.parse(localStorage.getItem('notificationsEnabled') || 'false'),
    _unsub: null,

    /**
     * Request notification permission and register FCM token.
     */
    requestPermission: async (userId) => {
        if (typeof Notification === 'undefined') return 'denied';
        const result = await Notification.requestPermission();
        const enabled = result === 'granted';
        set({ permission: result, enabled });
        localStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
        if (enabled && userId) {
            await get().registerFcmToken(userId);
        }
        return result;
    },

    /**
     * Register the FCM token for push notifications.
     */
    registerFcmToken: async (userId) => {
        try {
            const messaging = getMessagingInstance();
            if (!messaging) return;

            // Register FCM service worker with its own scope to avoid conflicts with PWA SW
            const swReg = await navigator.serviceWorker.register(
                '/firebase-messaging-sw.js',
                { scope: '/firebase-cloud-messaging-push-scope' }
            );

            const tokenOptions = { serviceWorkerRegistration: swReg };
            if (VAPID_KEY) tokenOptions.vapidKey = VAPID_KEY;

            const token = await getToken(messaging, tokenOptions);
            if (!token) return;

            // Store token in Firestore under fcmTokens/{userId}
            const tokenRef = doc(db, 'fcmTokens', userId);
            const tokenDoc = await getDoc(tokenRef);
            if (tokenDoc.exists()) {
                const existing = tokenDoc.data().tokens || [];
                if (!existing.includes(token)) {
                    await setDoc(tokenRef, { tokens: [...existing, token] }, { merge: true });
                }
            } else {
                await setDoc(tokenRef, { tokens: [token] });
            }
        } catch (err) {
            console.error('FCM token registration failed:', err);
        }
    },

    /**
     * Toggle notifications on/off.
     */
    setEnabled: (enabled, userId) => {
        set({ enabled });
        localStorage.setItem('notificationsEnabled', JSON.stringify(enabled));
        if (enabled && typeof Notification !== 'undefined' && Notification.permission === 'default') {
            get().requestPermission(userId);
        } else if (enabled && userId) {
            get().registerFcmToken(userId);
        }
    },

    /**
     * Start listening for notifications addressed to this user.
     * Shows a browser notification for each new one.
     */
    startListening: (userId) => {
        const prev = get()._unsub;
        if (prev) prev();

        // Register/refresh FCM token for returning users
        if (get().enabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            get().registerFcmToken(userId);
        }

        const unsub = NotificationService.subscribeToNotifications(userId, (notif) => {
            // Don't notify for own actions
            if (notif.senderId === userId) return;
            if (!get().enabled) return;

            get().showNotification(notif);
        });

        set({ _unsub: unsub });
    },

    /**
     * Stop listening for notifications.
     */
    stopListening: () => {
        const unsub = get()._unsub;
        if (unsub) unsub();
        set({ _unsub: null });
    },

    /**
     * Show a browser/PWA notification.
     */
    showNotification: (notif) => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

        const { title, body } = formatNotification(notif);
        try {
            new Notification(title, {
                body,
                icon: '/pwa-192x192.png',
                badge: '/pwa-192x192.png',
                tag: notif.id, // prevents duplicates
            });
        } catch {
            // Safari/iOS may not support Notification constructor in all contexts
        }
    },
}));

/**
 * Format a notification object into a user-facing title & body.
 */
function formatNotification(notif) {
    const name = notif.senderName || 'Someone';
    const groupName = notif.data?.groupName || '';
    const gameDate = notif.data?.gameDate || '';

    switch (notif.type) {
        case 'game_created':
            return {
                title: `⚽ New Game — ${groupName}`,
                body: `${name} scheduled a game${gameDate ? ` for ${gameDate}` : ''}`,
            };
        case 'game_cancelled':
            return {
                title: `❌ Game Cancelled — ${groupName}`,
                body: `${name} cancelled the game${gameDate ? ` on ${gameDate}` : ''}`,
            };
        case 'player_in':
            return {
                title: `✅ ${name} is IN`,
                body: `${groupName}${gameDate ? ` — ${gameDate}` : ''}`,
            };
        case 'player_out':
            return {
                title: `🚫 ${name} is OUT`,
                body: `${groupName}${gameDate ? ` — ${gameDate}` : ''}`,
            };
        case 'game_confirmed':
            return {
                title: `🎉 Game Confirmed! — ${groupName}`,
                body: `Minimum players reached${gameDate ? ` for ${gameDate}` : ''}`,
            };
        case 'game_needs_players':
            return {
                title: `⚠️ Need More Players — ${groupName}`,
                body: `Game dropped below minimum${gameDate ? ` for ${gameDate}` : ''}`,
            };
        default:
            return {
                title: 'SquadUp',
                body: 'You have a new notification',
            };
    }
}

export default useNotificationStore;
