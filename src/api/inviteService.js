import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

const invitesRef = collection(db, 'invites');

function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const InviteService = {
    createInvite: async ({ groupId, groupName, createdBy }) => {
        const code = generateCode();
        const invite = {
            code,
            groupId,
            groupName,
            createdBy,
            createdAt: new Date().toISOString(),
            active: true,
        };
        await setDoc(doc(db, 'invites', code), invite);
        return invite;
    },

    getInviteByCode: async (code) => {
        const docSnap = await getDoc(doc(db, 'invites', code));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() };
    },

    getInvitesByGroup: async (groupId) => {
        const q = query(invitesRef, where('groupId', '==', groupId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    deactivateInvite: async (code) => {
        await updateDoc(doc(db, 'invites', code), { active: false });
    },

    deleteInvite: async (code) => {
        await deleteDoc(doc(db, 'invites', code));
    },
};

export default InviteService;
