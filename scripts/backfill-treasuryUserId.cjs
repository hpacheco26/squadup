/**
 * One-time backfill: denormalize `treasuryUserId` onto existing group docs so the
 * `isGroupTreasury()` Firestore rule can authorize the treasury to manage debts.
 *
 * For each group with a `treasuryPlayerId`, sets `treasuryUserId` to the linked
 * account uid of that player row (or null if the treasury player isn't linked).
 *
 * Usage (firebase-admin lives under functions/node_modules):
 *   $env:NODE_PATH="functions/node_modules"; node scripts/backfill-treasuryUserId.cjs <serviceAccountKey.json> [--dry-run]
 */
const admin = require('firebase-admin');
const path = require('path');

const keyPath = process.argv[2];
const dryRun = process.argv.includes('--dry-run');

if (!keyPath) {
    console.error('Usage: node scripts/backfill-treasuryUserId.cjs <serviceAccountKey.json> [--dry-run]');
    process.exit(1);
}

const serviceAccount = require(path.resolve(keyPath));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

(async () => {
    const snapshot = await db.collection('groups').get();
    let updated = 0;
    let skipped = 0;

    for (const docSnap of snapshot.docs) {
        const g = docSnap.data();
        const players = Array.isArray(g.players) ? g.players : [];
        const treasuryPlayer = g.treasuryPlayerId
            ? players.find(p => p.id === g.treasuryPlayerId)
            : null;
        const treasuryUserId = treasuryPlayer?.userId || null;

        if (g.treasuryUserId === treasuryUserId) {
            skipped++;
            continue;
        }

        console.log(`${docSnap.id}: treasuryUserId ${JSON.stringify(g.treasuryUserId)} -> ${JSON.stringify(treasuryUserId)}`);
        if (!dryRun) {
            await docSnap.ref.update({ treasuryUserId });
        }
        updated++;
    }

    console.log('--------------------------------------');
    console.log(`${dryRun ? '[dry-run] would update' : 'updated'}: ${updated}, unchanged: ${skipped}, total: ${snapshot.size}`);
    process.exit(0);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
