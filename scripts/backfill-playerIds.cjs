/**
 * One-time migration: backfill `playerIds` on all group documents.
 *
 * Usage:
 *   node scripts/backfill-playerIds.js path/to/serviceAccountKey.json
 *
 * The service account key can be downloaded from:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 */

const admin = require('firebase-admin');
const path = require('path');

const keyPath = process.argv[2];
if (!keyPath) {
    console.error('Usage: node scripts/backfill-playerIds.js <serviceAccountKey.json>');
    process.exit(1);
}

const serviceAccount = require(path.resolve(keyPath));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function backfill() {
    const snapshot = await db.collection('groups').get();
    console.log(`Found ${snapshot.size} group(s).`);

    let updated = 0;
    let skipped = 0;

    const batch = db.batch();

    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const players = Array.isArray(data.players) ? data.players : [];
        const newPlayerIds = players.map(p => p.id);
        const existingPlayerIds = data.playerIds;

        // Skip if already correct
        if (
            Array.isArray(existingPlayerIds) &&
            existingPlayerIds.length === newPlayerIds.length &&
            newPlayerIds.every(id => existingPlayerIds.includes(id))
        ) {
            console.log(`  SKIP  ${docSnap.id} (already up to date, ${newPlayerIds.length} players)`);
            skipped++;
            continue;
        }

        console.log(`  UPDATE ${docSnap.id}: setting playerIds = [${newPlayerIds.join(', ')}]`);
        batch.update(docSnap.ref, { playerIds: newPlayerIds });
        updated++;

        // Firestore batches are capped at 500 ops — flush and start a new one if needed
        if (updated % 499 === 0) {
            await batch.commit();
            console.log('  Flushed batch of 499');
        }
    }

    await batch.commit();
    console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);
}

backfill().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
