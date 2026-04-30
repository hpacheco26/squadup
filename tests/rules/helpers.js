/**
 * Shared helpers for Firestore security rules tests.
 *
 * Requires the Firebase emulators to be running. Use:
 *   npm run test:rules
 * which wraps execution in `firebase emulators:exec`.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

const PROJECT_ID = 'squadup-rules-test';

/**
 * Spin up an isolated test environment loaded with the project's Firestore rules.
 * Each test file should call this in `beforeAll` and tear it down in `afterAll`.
 */
export async function getTestEnv() {
    const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
    return initializeTestEnvironment({
        projectId: PROJECT_ID,
        firestore: {
            rules,
            host: '127.0.0.1',
            port: 8080,
        },
    });
}

/** Authenticated context for a given UID. */
export const asUser = (env, uid, claims = {}) => env.authenticatedContext(uid, claims).firestore();

/** Unauthenticated context. */
export const asAnon = (env) => env.unauthenticatedContext().firestore();

/** Privileged context that bypasses rules — use only for arranging fixtures. */
export const asAdmin = (env) => env.withSecurityRulesDisabled((ctx) => ctx.firestore());
