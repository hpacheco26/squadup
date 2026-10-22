/**
 * One-time, NON-DESTRUCTIVE migration: attach season fields to every group.
 *
 * Existing groups keep their current ranks/stats and become the live "Season 0".
 * The first reset happens later, when Season 0 ends (reaches the target number of
 * games or an admin ends it) and Season 1 starts fresh. See docs/seasons-proposal.md.
 *
 * This script does NOT touch `players[]`, debts, treasury, admins, or games.
 *
 * Usage:
 *   node scripts/migrate-seasons.cjs <serviceAccountKey.json>            # dry run (default)
 *   node scripts/migrate-seasons.cjs <serviceAccountKey.json> --apply    # write changes
 *   node scripts/migrate-seasons.cjs --firebase-cli --project <projectId> [--apply]
 *
 * --firebase-cli uses the existing default CLI account in memory. No credential
 * file is created; --project is mandatory to avoid migrating the wrong project.
 *
 * The service account key can be downloaded from:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 *
 * Re-running only fills missing fields. Each write transaction rereads the group,
 * so counters written by a concurrent game completion are never overwritten.
 * firebase-admin is resolved from the root or functions installation.
 */

const path = require('path');
const admin = require(require.resolve('firebase-admin', {
    paths: [path.resolve(__dirname, '..'), path.resolve(__dirname, '..', 'functions')],
}));

// Keep in sync with DEFAULT_GAMES_PER_SEASON / LAUNCH_SEASON_NUMBER in src/utils/seasons.js
const DEFAULT_GAMES_PER_SEASON = 48;
const LAUNCH_SEASON_NUMBER = 0;

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const useFirebaseCli = args.includes('--firebase-cli');
const usage = 'Usage: node scripts/migrate-seasons.cjs <serviceAccountKey.json> [--apply]\n'
    + '   or: node scripts/migrate-seasons.cjs --firebase-cli --project <projectId> [--apply]';

function initializeDatabase() {
    const positional = [];
    let projectId;
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--project') {
            projectId = args[++i];
            if (!projectId || projectId.startsWith('--')) throw new Error(usage);
        } else if (arg !== '--apply' && arg !== '--firebase-cli') {
            if (arg.startsWith('--')) throw new Error(usage);
            positional.push(arg);
        }
    }

    if (useFirebaseCli) {
        if (!projectId || positional.length !== 0) throw new Error(usage);
        const auth = require('firebase-tools/lib/auth');
        const api = require('firebase-tools/lib/api');
        const account = auth.getGlobalDefaultAccount();
        if (!account?.tokens?.refresh_token) {
            throw new Error('No default Firebase CLI account. Run firebase login, then retry.');
        }
        admin.initializeApp({ projectId });
        const db = admin.firestore();
        // CLI getAccessToken refreshes its on-disk account cache. Let the Google
        // auth client refresh in memory instead; never persist or print tokens.
        db.settings({
            credentials: {
                type: 'authorized_user',
                client_id: api.clientId(),
                client_secret: api.clientSecret(),
                refresh_token: account.tokens.refresh_token,
            },
        });
        return db;
    }

    if (positional.length !== 1 || projectId) throw new Error(usage);
    const serviceAccount = require(path.resolve(positional[0]));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return admin.firestore();
}

async function migrate() {
    let db;
    try {
        db = initializeDatabase();
    } catch (error) {
        // Only our validation messages are safe to print; SDK errors may contain credentials.
        if (error.message === usage || error.message.startsWith('No default Firebase CLI account.')) {
            console.error(error.message);
        } else {
            console.error('Could not initialize migration credentials. Check the selected auth mode and installed dependencies.');
        }
        process.exitCode = 1;
        return;
    }
    const snapshot = await db.collection('groups').get();
    console.log(`Found ${snapshot.size} group(s). Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}.`);

    let updated = 0;
    let skipped = 0;
    const now = Date.now();

    for (const docSnap of snapshot.docs) {
        const defaults = {
            seasonNumber: LAUNCH_SEASON_NUMBER,
            gamesPerSeason: DEFAULT_GAMES_PER_SEASON,
            seasonGamesPlayed: 0,
            seasonStartedAt: now,
        };
        let fields;
        if (APPLY) {
            fields = await db.runTransaction(async transaction => {
                const current = await transaction.get(docSnap.ref);
                if (!current.exists) return null;
                const data = current.data();
                const missing = Object.fromEntries(Object.entries(defaults)
                    .filter(([field]) => !Object.prototype.hasOwnProperty.call(data, field)));
                if (Object.keys(missing).length > 0) transaction.update(docSnap.ref, missing);
                return missing;
            });
        } else {
            const data = docSnap.data();
            fields = Object.fromEntries(Object.entries(defaults)
                .filter(([field]) => !Object.prototype.hasOwnProperty.call(data, field)));
        }
        if (!fields || Object.keys(fields).length === 0) {
            skipped++;
        } else {
            console.log(`  ${APPLY ? 'UPDATED' : 'WOULD UPDATE'} ${docSnap.id}: ${JSON.stringify(fields)} (existing fields and ranks untouched)`);
            updated++;
        }
    }

    console.log(`\nDone. ${APPLY ? 'Updated' : 'Would update'}: ${updated}, Skipped (complete or removed): ${skipped}.`);
    if (!APPLY && updated > 0) {
        console.log('Re-run with --apply to write these changes.');
    }
}

migrate().catch(() => {
    console.error('Migration failed. Check project ID, account permissions, authentication, and network connectivity. No credentials were logged.');
    process.exitCode = 1;
});
