/**
 * One-time backfill: recompute `playerIds` and `memberUserIds` from `players` on every
 * group doc, so membership lookups (which now key on auth uid via `memberUserIds`) work
 * for groups written before those derived fields existed.
 *
 * Idempotent and additive. Usage (firebase-admin lives under functions/node_modules):
 *   $env:NODE_PATH="functions/node_modules"; node scripts/backfill-memberUserIds.cjs <serviceAccountKey.json> [--dry-run]
 */
const admin = require('firebase-admin');
const path = require('path');

const keyPath = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!keyPath) {
    console.error('Usage: node scripts/backfill-memberUserIds.cjs <serviceAccountKey.json> [--dry-run]');
    process.exit(1);
}

const serviceAccount = require(path.resolve(keyPath));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const arraysEqual = (a, b) =>
    Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]);

(async () => {
    const snapshot = await db.collection('groups').get();
    let updated = 0;
    let skipped = 0;

    for (const docSnap of snapshot.docs) {
        const g = docSnap.data();
        const players = Array.isArray(g.players) ? g.players : [];
        const playerIds = players.map(p => p.id);
        const memberUserIds = players.filter(p => p.userId).map(p => p.userId);

        if (arraysEqual(g.playerIds, playerIds) && arraysEqual(g.memberUserIds, memberUserIds)) {
            skipped++;
            continue;
        }

        console.log(`${docSnap.id}: memberUserIds ${(g.memberUserIds || []).length} -> ${memberUserIds.length}, playerIds ${(g.playerIds || []).length} -> ${playerIds.length}`);
        if (!dryRun) {
            await docSnap.ref.update({ playerIds, memberUserIds });
        }
        updated++;
    }

    console.log('--------------------------------------');
    console.log(`${dryRun ? '[dry-run] would update' : 'updated'}: ${updated}, unchanged: ${skipped}, total: ${snapshot.size}`);
    process.exit(0);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
