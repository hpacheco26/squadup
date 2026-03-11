import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const groupsRef = collection(db, 'groups');

const GroupService = {
    getGroups: async () => {
        const snapshot = await getDocs(groupsRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    getGroupById: async (id) => {
        const docSnap = await getDoc(doc(db, 'groups', id));
        if (!docSnap.exists()) return null;
        return { id: docSnap.id, ...docSnap.data() };
    },

    getGroupsByPlayer: async (playerId) => {
        const snapshot = await getDocs(groupsRef);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(group => group.players.some(player => player.id === playerId));
    },

    createGroup: async (groupData) => {
        const { name, adminId } = groupData;
        const formattedId = `${name.replace(/\s+/g, '').toLowerCase()}-${adminId}`;
        const dataWithId = { ...groupData, id: formattedId };
        await setDoc(doc(db, 'groups', formattedId), dataWithId);
        return dataWithId;
    },

    updateGroup: async (id, updatedData) => {
        await updateDoc(doc(db, 'groups', id), updatedData);
        return updatedData;
    },

    deleteGroup: async (id) => {
        await deleteDoc(doc(db, 'groups', id));
    },
};

export default GroupService;
