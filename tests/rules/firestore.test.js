import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, runTransaction, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
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
        await asAdmin(env, async (db) => {
            await setDoc(doc(db, 'config/allowedCreators'), { uids: ['allowed-uid'] });
        });
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
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'players/p1'), { userId: 'uid-1', firstName: 'Alice', rank: 0 });
        });
        const db = asUser(env, 'uid-1');
        await assertSucceeds(updateDoc(doc(db, 'players/p1'), { firstName: 'Alicia' }));
    });

    it('denies another user from updating someone else\'s player doc', async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'players/p1'), { userId: 'uid-1', firstName: 'Alice', rank: 0 });
        });
        const intruder = asUser(env, 'uid-2');
        await assertFails(updateDoc(doc(intruder, 'players/p1'), { firstName: 'Hacked' }));
    });

    it('denies another user from deleting someone else\'s player doc', async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'players/p1'), { userId: 'uid-1', firstName: 'Alice', rank: 0 });
        });
        const intruder = asUser(env, 'uid-2');
        await assertFails(deleteDoc(doc(intruder, 'players/p1')));
    });
});

describe('groups/* — create gated by allowedCreators allowlist', () => {
    beforeEach(async () => {
        await asAdmin(env, async (db) => {
            await setDoc(doc(db, 'config/allowedCreators'), { uids: ['allowed-uid'] });
        });
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
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'groups/g1'), {
                name: 'Squad', adminId: 'allowed-uid', adminIds: ['allowed-uid'], players: [],
            });
        });

        const intruder = asUser(env, 'random-uid');
        await assertFails(deleteDoc(doc(intruder, 'groups/g1')));

        const owner = asUser(env, 'allowed-uid');
        await assertSucceeds(deleteDoc(doc(owner, 'groups/g1')));
    });
});

describe('groups/* — self-join via invite link (non-admin)', () => {
    beforeEach(async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'groups/g1'), {
                name: 'Squad', adminId: 'admin-uid', adminIds: ['admin-uid'],
                players: [{ id: 'p-unclaimed', firstName: 'Alice', lastName: '', rank: 0 }],
                playerIds: ['p-unclaimed'],
                memberUserIds: [],
            });
        });
    });

    it('allows a new user to claim an existing unlinked player row', async () => {
        const db = asUser(env, 'uid-1');
        await assertSucceeds(updateDoc(doc(db, 'groups/g1'), {
            players: [{ id: 'p-unclaimed', firstName: 'Alice', lastName: '', rank: 0, userId: 'uid-1' }],
            playerIds: ['p-unclaimed'],
            memberUserIds: ['uid-1'],
        }));
    });

    it('allows a new user to join by appending a brand-new player row', async () => {
        const db = asUser(env, 'uid-2');
        await assertSucceeds(updateDoc(doc(db, 'groups/g1'), {
            players: [
                { id: 'p-unclaimed', firstName: 'Alice', lastName: '', rank: 0 },
                { id: 'p-new', firstName: 'Bob', lastName: '', rank: 0, userId: 'uid-2' },
            ],
            playerIds: ['p-unclaimed', 'p-new'],
            memberUserIds: ['uid-2'],
        }));
    });

    it('denies a user from tampering with another player\'s row while joining', async () => {
        const db = asUser(env, 'uid-3');
        await assertFails(updateDoc(doc(db, 'groups/g1'), {
            players: [
                { id: 'p-unclaimed', firstName: 'Mallory', lastName: '', rank: 999 },
                { id: 'p-new', firstName: 'Eve', lastName: '', rank: 0, userId: 'uid-3' },
            ],
            playerIds: ['p-unclaimed', 'p-new'],
            memberUserIds: ['uid-3'],
        }));
    });

    it('denies a user from removing an existing member while joining', async () => {
        const db = asUser(env, 'uid-4');
        await assertFails(updateDoc(doc(db, 'groups/g1'), {
            players: [{ id: 'p-new', firstName: 'Eve', lastName: '', rank: 0, userId: 'uid-4' }],
            playerIds: ['p-new'],
            memberUserIds: ['uid-4'],
        }));
    });

    it('denies a user from also changing unrelated fields (e.g. group name) while joining', async () => {
        const db = asUser(env, 'uid-5');
        await assertFails(updateDoc(doc(db, 'groups/g1'), {
            name: 'Hacked Squad',
            players: [
                { id: 'p-unclaimed', firstName: 'Alice', lastName: '', rank: 0 },
                { id: 'p-new', firstName: 'Eve', lastName: '', rank: 0, userId: 'uid-5' },
            ],
            playerIds: ['p-unclaimed', 'p-new'],
            memberUserIds: ['uid-5'],
        }));
    });

    it('denies a user who is already a member from re-writing the players list', async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'groups/g1'), {
                name: 'Squad', adminId: 'admin-uid', adminIds: ['admin-uid'],
                players: [{ id: 'p-member', firstName: 'Alice', lastName: '', rank: 0, userId: 'uid-6' }],
                playerIds: ['p-member'],
                memberUserIds: ['uid-6'],
            });
        });
        const db = asUser(env, 'uid-6');
        await assertFails(updateDoc(doc(db, 'groups/g1'), {
            players: [
                { id: 'p-member', firstName: 'Alice', lastName: '', rank: 0, userId: 'uid-6' },
                { id: 'p-new', firstName: 'Extra', lastName: '', rank: 0, userId: 'uid-6' },
            ],
            playerIds: ['p-member', 'p-new'],
            memberUserIds: ['uid-6', 'uid-6'],
        }));
    });
});

describe('games/* — any auth user can update; only group admin can delete', () => {
    beforeEach(async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'config/allowedCreators'), { uids: ['admin-uid'] });
            await setDoc(doc(admin, 'groups/g1'), {
                name: 'Squad', adminId: 'admin-uid', adminIds: ['admin-uid'], players: [],
            });
            await setDoc(doc(admin, 'games/game1'), {
                groupId: 'g1', adminId: 'admin-uid', status: 'open', playersIn: [],
            });
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

describe('groups/{g}/seasons/* — authenticated read, atomic admin rollover, immutable', () => {
    const archive = {
        number: 1, gamesPlayed: 48, gamesPerSeason: 48,
        endReason: 'manual', endedAt: new Date('2026-01-01T00:00:00Z'), standings: [],
    };

    beforeEach(async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'groups/g1'), {
                name: 'Squad', adminId: 'admin-uid', adminIds: ['admin-uid'], players: [],
                seasonNumber: 1, seasonGamesPlayed: 48, gamesPerSeason: 48,
            });
            await setDoc(doc(admin, 'groups/g1/seasons/season-0'), {
                ...archive, number: 0, endReason: 'target',
            });
        });
    });

    it('allows any authenticated user to read a season archive', async () => {
        const db = asUser(env, 'player-uid');
        await assertSucceeds(getDoc(doc(db, 'groups/g1/seasons/season-0')));
    });

    it('denies unauthenticated read', async () => {
        const db = asAnon(env);
        await assertFails(getDoc(doc(db, 'groups/g1/seasons/season-0')));
    });

    it('allows a group admin to archive and roll over the season atomically', async () => {
        const db = asUser(env, 'admin-uid');
        const batch = writeBatch(db);
        batch.set(doc(db, 'groups/g1/seasons/season-1'), archive);
        batch.update(doc(db, 'groups/g1'), { seasonNumber: 2, seasonGamesPlayed: 0 });
        await assertSucceeds(batch.commit());
    });

    it('denies standalone archive creation without a group rollover, even for admin', async () => {
        const db = asUser(env, 'admin-uid');
        await assertFails(setDoc(doc(db, 'groups/g1/seasons/season-1'), archive));
    });

    it.each([
        ['wrong season number', { number: 0 }],
        ['fractional games played', { gamesPlayed: 1.5 }],
        ['negative games played', { gamesPlayed: -1 }],
        ['target below minimum', { gamesPerSeason: 4 }],
        ['target above maximum', { gamesPerSeason: 201 }],
        ['fractional target', { gamesPerSeason: 48.5 }],
        ['invalid end reason', { endReason: 'other' }],
        ['non-list standings', { standings: {} }],
    ])('denies an atomic archive with %s', async (_label, overrides) => {
        const db = asUser(env, 'admin-uid');
        const batch = writeBatch(db);
        batch.set(doc(db, 'groups/g1/seasons/season-1'), { ...archive, ...overrides });
        batch.update(doc(db, 'groups/g1'), {
            seasonNumber: (overrides.number ?? archive.number) + 1, seasonGamesPlayed: 0,
        });
        await assertFails(batch.commit());
    });

    it('denies an archive without endedAt even with an atomic rollover', async () => {
        const db = asUser(env, 'admin-uid');
        const withoutEndedAt = { ...archive };
        delete withoutEndedAt.endedAt;
        const batch = writeBatch(db);
        batch.set(doc(db, 'groups/g1/seasons/season-1'), withoutEndedAt);
        batch.update(doc(db, 'groups/g1'), { seasonNumber: 2, seasonGamesPlayed: 0 });
        await assertFails(batch.commit());
    });

    it.each([
        ['unchanged season number', { seasonNumber: 1, seasonGamesPlayed: 0 }],
        ['skipped season number', { seasonNumber: 3, seasonGamesPlayed: 0 }],
        ['nonzero games played', { seasonNumber: 2, seasonGamesPlayed: 48 }],
    ])('denies an archive with %s in the group rollover', async (_label, rollover) => {
        const db = asUser(env, 'admin-uid');
        const batch = writeBatch(db);
        batch.set(doc(db, 'groups/g1/seasons/season-1'), archive);
        batch.update(doc(db, 'groups/g1'), rollover);
        await assertFails(batch.commit());
    });

    it('denies a non-admin from creating a season archive', async () => {
        const db = asUser(env, 'random-uid');
        await assertFails(setDoc(doc(db, 'groups/g1/seasons/season-1'), archive));
    });

    it('denies updating an existing (immutable) season archive, even for admin', async () => {
        const db = asUser(env, 'admin-uid');
        await assertFails(updateDoc(doc(db, 'groups/g1/seasons/season-0'), { gamesPlayed: 99 }));
    });

    it('denies deleting a season archive, even for admin', async () => {
        const db = asUser(env, 'admin-uid');
        await assertFails(deleteDoc(doc(db, 'groups/g1/seasons/season-0')));
    });
});

describe('groups/{g}/completedGames/* — authenticated read, admin create, immutable', () => {
    const receipt = {
        groupId: 'g1', gameId: 'game1', completedBy: 'admin-uid',
        seasonNumber: 1, team1Goals: 2, team2Goals: 0,
    };

    beforeEach(async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'groups/g1'), {
                name: 'Squad', adminId: 'admin-uid', adminIds: ['coadmin-uid'],
                players: [{ id: 'p1', userId: 'member-uid' }],
                playerIds: ['p1'], memberUserIds: ['member-uid'],
                seasonNumber: 1, seasonGamesPlayed: 47, gamesPerSeason: 48,
            });
            await setDoc(doc(admin, 'games/game1'), { groupId: 'g1', status: 'open' });
            await setDoc(doc(admin, 'games/other-game'), { groupId: 'g2', status: 'open' });
            await setDoc(doc(admin, 'groups/g1/completedGames/previous-game'), {
                ...receipt, gameId: 'previous-game',
            });
        });
    });

    function completeGame(db, data) {
        return runTransaction(db, async (transaction) => {
            const groupRef = doc(db, 'groups/g1');
            const gameRef = doc(db, 'games/game1');
            const group = await transaction.get(groupRef);
            await transaction.get(gameRef);
            transaction.set(doc(db, 'groups/g1/completedGames/game1'), data);
            transaction.update(groupRef, {
                seasonGamesPlayed: group.data().seasonGamesPlayed + 1,
            });
            transaction.delete(gameRef);
        });
    }

    it.each(['member-uid', 'unrelated-uid'])('allows authenticated receipt read for %s', async (uid) => {
        const db = asUser(env, uid);
        await assertSucceeds(getDoc(doc(db, 'groups/g1/completedGames/previous-game')));
    });

    it('denies unauthenticated receipt read', async () => {
        const db = asAnon(env);
        await assertFails(getDoc(doc(db, 'groups/g1/completedGames/previous-game')));
    });

    it.each(['admin-uid', 'coadmin-uid'])('allows %s to create a receipt while completing a game', async (uid) => {
        const db = asUser(env, uid);
        await assertSucceeds(completeGame(db, { ...receipt, completedBy: uid }));
    });

    it('denies a member from creating a receipt with their own completedBy', async () => {
        const db = asUser(env, 'member-uid');
        await assertFails(setDoc(doc(db, 'groups/g1/completedGames/game1'), {
            ...receipt, completedBy: 'member-uid',
        }));
    });

    it('denies unauthenticated receipt creation', async () => {
        const db = asAnon(env);
        await assertFails(setDoc(doc(db, 'groups/g1/completedGames/game1'), receipt));
    });

    it.each([
        ['mismatched group ID', { groupId: 'g2' }],
        ['mismatched game ID', { gameId: 'other-game' }],
        ['another completing user', { completedBy: 'member-uid' }],
        ['negative first score', { team1Goals: -1 }],
        ['negative second score', { team2Goals: -1 }],
        ['fractional first score', { team1Goals: 1.5 }],
        ['fractional second score', { team2Goals: 1.5 }],
        ['string first score', { team1Goals: '2' }],
        ['string second score', { team2Goals: '0' }],
        ['mismatched season', { seasonNumber: 2 }],
    ])('denies a receipt with %s', async (_label, overrides) => {
        const db = asUser(env, 'admin-uid');
        await assertFails(completeGame(db, { ...receipt, ...overrides }));
    });

    it.each(['missing-game', 'other-game'])('denies a receipt for %s', async (gameId) => {
        const db = asUser(env, 'admin-uid');
        await assertFails(setDoc(doc(db, `groups/g1/completedGames/${gameId}`), {
            ...receipt, gameId,
        }));
    });

    it('allows a receipt matching the post-rollover season in the same transaction', async () => {
        const db = asUser(env, 'admin-uid');
        await assertSucceeds(runTransaction(db, async (transaction) => {
            const groupRef = doc(db, 'groups/g1');
            const gameRef = doc(db, 'games/game1');
            const group = await transaction.get(groupRef);
            await transaction.get(gameRef);
            transaction.set(doc(db, 'groups/g1/seasons/season-1'), {
                number: group.data().seasonNumber,
                gamesPlayed: 48, gamesPerSeason: 48, endReason: 'target',
                endedAt: new Date('2026-01-01T00:00:00Z'), standings: [],
            });
            transaction.set(doc(db, 'groups/g1/completedGames/game1'), {
                ...receipt, seasonNumber: 2,
            });
            transaction.update(groupRef, { seasonNumber: 2, seasonGamesPlayed: 0 });
            transaction.delete(gameRef);
        }));
    });

    it('denies a receipt matching only the pre-write season', async () => {
        const db = asUser(env, 'admin-uid');
        const batch = writeBatch(db);
        batch.set(doc(db, 'groups/g1/completedGames/game1'), receipt);
        batch.update(doc(db, 'groups/g1'), { seasonNumber: 2, seasonGamesPlayed: 0 });
        await assertFails(batch.commit());
    });

    it.each(['admin-uid', 'member-uid'])('denies receipt updates by %s', async (uid) => {
        const db = asUser(env, uid);
        await assertFails(updateDoc(doc(db, 'groups/g1/completedGames/previous-game'), {
            team1Goals: 99,
        }));
    });

    it.each(['admin-uid', 'member-uid'])('denies receipt deletion by %s', async (uid) => {
        const db = asUser(env, uid);
        await assertFails(deleteDoc(doc(db, 'groups/g1/completedGames/previous-game')));
    });
});

describe('notifications/* — read/update scoped to recipientIds, no delete', () => {
    beforeEach(async () => {
        await asAdmin(env, async (db) => {
            await setDoc(doc(db, 'notifications/n1'), {
                type: 'gameInvite', recipientIds: ['uid-recipient'], senderId: 'uid-sender',
                createdAt: new Date(),
            });
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
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'fcmTokens/uid-1'), { tokens: ['t1'] });
        });
        const db = asAnon(env);
        await assertFails(getDoc(doc(db, 'fcmTokens/uid-1')));
    });
});

describe('gameDebts/* — any member updates; admin or treasury can delete', () => {
    beforeEach(async () => {
        await asAdmin(env, async (admin) => {
            await setDoc(doc(admin, 'groups/g1'), {
                name: 'Squad', adminId: 'admin-uid', adminIds: ['admin-uid'],
                treasuryUserId: 'treasury-uid', players: [],
            });
            await setDoc(doc(admin, 'gameDebts/d1'), {
                groupId: 'g1', debts: { p1: { amount: 5, paid: false } },
            });
        });
    });

    it('allows any authenticated user to update (mark paid)', async () => {
        const db = asUser(env, 'member-uid');
        await assertSucceeds(updateDoc(doc(db, 'gameDebts/d1'), { 'debts.p1.paid': true }));
    });

    it('allows the group admin to delete', async () => {
        const db = asUser(env, 'admin-uid');
        await assertSucceeds(deleteDoc(doc(db, 'gameDebts/d1')));
    });

    it('allows the group treasury to delete', async () => {
        const db = asUser(env, 'treasury-uid');
        await assertSucceeds(deleteDoc(doc(db, 'gameDebts/d1')));
    });

    it('denies a non-admin, non-treasury member from deleting', async () => {
        const db = asUser(env, 'member-uid');
        await assertFails(deleteDoc(doc(db, 'gameDebts/d1')));
    });
});
