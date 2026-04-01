import { db } from '../config/firebase';
import { collection, doc, addDoc, query, where, orderBy, onSnapshot, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

const notificationsRef = collection(db, 'notifications');

/**
 * Notification types:
 * - game_created: A new game was scheduled
 * - game_cancelled: A game was cancelled/deleted
 * - player_in: A player confirmed attendance
 * - player_out: A player declined attendance
 * - game_confirmed: Game reached minimum players
 * - game_needs_players: Game dropped below minimum
 */

const NotificationService = {
    /**
     * Send a notification to all players in a group (except the sender).
     */
    send: async ({ type, groupId, gameId, senderName, senderId, recipientIds, data = {} }) => {
        const notification = {
            type,
            groupId,
            gameId: gameId || null,
            senderName: senderName || 'Someone',
            senderId: senderId || null,
            recipientIds: recipientIds || [],
            data,
            createdAt: serverTimestamp(),
        };
        await addDoc(notificationsRef, notification);
    },

    /**
     * Subscribe to notifications for a specific user (by userId).
     * Only fetches notifications from the last 24 hours.
     */
    subscribeToNotifications: (userId, callback) => {
        const oneDayAgo = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
        const q = query(
            notificationsRef,
            where('recipientIds', 'array-contains', userId),
            where('createdAt', '>', oneDayAgo),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notif = { id: change.doc.id, ...change.doc.data() };
                    callback(notif);
                }
            });
        }, (error) => {
            console.warn('Notification listener error:', error.code);
        });
    },

    /**
     * Mark a notification as read (optional, for future in-app notification list).
     */
    markAsRead: async (notificationId, userId) => {
        await updateDoc(doc(db, 'notifications', notificationId), {
            [`readBy.${userId}`]: true,
        });
    },
};

export default NotificationService;
