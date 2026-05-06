import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { asAdmin, asAnon, asUser, getTestEnv } from './helpers.js';

let env;

beforeAll(async () => {
    env = await getTestEnv();
});

afterAll(async () => {
    if (env) await env.cleanup();
});

beforeEach(async () => {
    await env.clearFirestore();
});

describe('config/* — read-only for authenticated users', () => {
    beforeEach(async () => {
        const db = asAdmin(env);
        await setDoc(doc(db, 'config/allowedCreators'), { uids: ['allowed-uid'] });
    });

    it('allows read for any authenticated user', async () => {
        const db = asUser(env, 'someone');
        await assertSucceeds(getDoc(doc(db, 'config/allowedCreators')));
    });

    it('denies read for anonymous users', async () => {
        const db = asAnon(env);
        await assertFails(getDoc(doc(db, 'config/allowedCreators')));
    });

    it('denies any write, even for authenticated users', async () => {
        const db = asUser(env, 'someone');
        await assertFails(setDoc(doc(db, 'config/somethingNew'), { foo: 1 }));
    });
});

describe('players/* — auth required, create scoped to own userId', () => {
    it('allows authenticated user to create a player doc with their own userId', async () => {
        const db = asUser(env, 'uid-1');
        await assertSucceeds(setDoc(doc(db, 'players/p1'), {
            userId: 'uid-1', firstName: 'Alice', rank: 0,
        }));
    });

    it('denies create when userId does not match auth uid', async () => {
        const db = asUser(env, 'uid-1');
        await assertFails(setDoc(doc(db, 'players/p1'), {
            userId: 'someone-else', firstName: 'Mallory', rank: 0,
        }));
    });

    it('denies create for unauthenticated users', async () => {
        const db = asAnon(env);
        await assertFails(setDoc(doc(db, 'players/p1'), { userId: null }));
    });

    it('allows owner to update their player doc', async () => {
        const admin = asAdmin(env);
        await setDoc(doc(admin, 'players/p1'), { userId: 'uid-1', firstName: 'Alice', rank: 0 });
        const db = asUser(env, 'uid-1');
        await assertSucceeds(updateDoc(doc(db, 'players/p1'), { firstName: 'Alicia' }));
    });

    it('denies another user from updating someone else\'s player doc', async () => {
        const admin = asAdmin(env);
        await setDoc(doc(admin, 'players/p1'), { userId: 'uid-1', firstName: 'Alice', rank: 0 });
        const intruder = asUser(env, 'uid-2');
        await assertFails(updateDoc(doc(intruder, 'players/p1'), { firstName: 'Hacked' }));
    });

    it('denies another user from deleting someone else\'s player doc', async () => {
        const admin = asAdmin(env);
        await setDoc(doc(admin, 'players/p1'), { userId: 'uid-1', firstName: 'Alice', rank: 0 });
        const intruder = asUser(env, 'uid-2');
        await assertFails(deleteDoc(doc(intruder, 'players/p1')));
    });
});

describe('groups/* — create gated by allowedCreators allowlist', () => {
    beforeEach(async () => {
        const db = asAdmin(env);
        await setDoc(doc(db, 'config/allowedCreators'), { uids: ['allowed-uid'] });
    });

    it('allows creation when caller is in allowedCreators', async () => {
        const db = asUser(env, 'allowed-uid');
        await assertSucceeds(setDoc(doc(db, 'groups/g1'), {
            name: 'Squad', adminId: 'allowed-uid', adminIds: ['allowed-uid'], players: [],
        }));
    });

    it('denies creation for users not in the allowlist', async () => {
        const db = asUser(env, 'random-uid');
        await assertFails(setDoc(doc(db, 'groups/g1'), {
            name: 'Squad', adminId: 'random-uid', adminIds: ['random-uid'], players: [],
        }));
    });

    it('only the admin can delete the group', async () => {
        const admin = asAdmin(env);
        await setDoc(doc(admin, 'groups/g1'), {
            name: 'Squad', adminId: 'allowed-uid', adminIds: ['allowed-uid'], players: [],
        });

        const intruder = asUser(env, 'random-uid');
        await assertFails(deleteDoc(doc(intruder, 'groups/g1')));

        const owner = asUser(env, 'allowed-uid');
        await assertSucceeds(deleteDoc(doc(owner, 'groups/g1')));
    });
});

describe('games/* — any auth user can update; only group admin can delete', () => {
    beforeEach(async () => {
        const admin = asAdmin(env);
        await setDoc(doc(admin, 'config/allowedCreators'), { uids: ['admin-uid'] });
        await setDoc(doc(admin, 'groups/g1'), {
            name: 'Squad', adminId: 'admin-uid', adminIds: ['admin-uid'], players: [],
        });
        await setDoc(doc(admin, 'games/game1'), {
            groupId: 'g1', adminId: 'admin-uid', status: 'open', playersIn: [],
        });
    });

    it('allows any authenticated user to update a game (RSVP)', async () => {
        const db = asUser(env, 'player-uid');
        await assertSucceeds(updateDoc(doc(db, 'games/game1'), { playersIn: [] }));
    });

    it('denies unauthenticated users from updating', async () => {
        const db = asAnon(env);
        await assertFails(updateDoc(doc(db, 'games/game1'), { playersIn: [] }));
    });

    it('allows group admin to delete the game', async () => {
        const db = asUser(env, 'admin-uid');
        await assertSucceeds(deleteDoc(doc(db, 'games/game1')));
    });

    it('denies non-admin from deleting the game', async () => {
        const db = asUser(env, 'random-uid');
        await assertFails(deleteDoc(doc(db, 'games/game1')));
    });
});

describe('notifications/* — read/update scoped to recipientIds, no delete', () => {
    beforeEach(async () => {
        const db = asAdmin(env);
        await setDoc(doc(db, 'notifications/n1'), {
            type: 'gameInvite', recipientIds: ['uid-recipient'], senderId: 'uid-sender',
            createdAt: new Date(),
        });
    });

    it('allows recipient to read their notification', async () => {
        const db = asUser(env, 'uid-recipient');
        await assertSucceeds(getDoc(doc(db, 'notifications/n1')));
    });

    it('denies read for users not in recipientIds', async () => {
        const db = asUser(env, 'random-uid');
        await assertFails(getDoc(doc(db, 'notifications/n1')));
    });

    it('forbids deletion outright', async () => {
        const db = asUser(env, 'uid-recipient');
        await assertFails(deleteDoc(doc(db, 'notifications/n1')));
    });
});

describe('fcmTokens/{userId} — strictly user-scoped', () => {
    it('allows a user to write their own token doc', async () => {
        const db = asUser(env, 'uid-1');
        await assertSucceeds(setDoc(doc(db, 'fcmTokens/uid-1'), { tokens: ['t1'] }));
    });

    it('denies a user from writing another user’s token doc', async () => {
        const db = asUser(env, 'uid-1');
        await assertFails(setDoc(doc(db, 'fcmTokens/uid-2'), { tokens: ['t1'] }));
    });

    it('denies anonymous reads', async () => {
        const admin = asAdmin(env);
        await setDoc(doc(admin, 'fcmTokens/uid-1'), { tokens: ['t1'] });
        const db = asAnon(env);
        await assertFails(getDoc(doc(db, 'fcmTokens/uid-1')));
    });
});
