import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCbe0n03WFN4g-Z0TCKJtRJNiUzctffCNQ",
  authDomain: "squadup-a3a55.firebaseapp.com",
  projectId: "squadup-a3a55",
  storageBucket: "squadup-a3a55.firebasestorage.app",
  messagingSenderId: "497625770241",
  appId: "1:497625770241:web:26ae61b9730748c18ad300"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// E2E lifecycle tests build the app with VITE_USE_FIREBASE_EMULATOR=1 so that
// auth + firestore traffic is routed at the local emulator suite instead of
// production. Belt-and-braces: we ALSO require the page to be served from a
// local host. That way an accidental `VITE_USE_FIREBASE_EMULATOR=1` left in
// the shell env when running `npm run build && firebase deploy` cannot wire
// the production bundle at 127.0.0.1.
const isLocalHost = typeof window !== 'undefined'
  && /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(window.location.hostname);
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === '1' && isLocalHost) {
  const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
  const authPort = Number(import.meta.env.VITE_FIREBASE_AUTH_PORT || 9099);
  const firestorePort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_PORT || 8080);
  try {
    connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, firestorePort);
    // eslint-disable-next-line no-console
    console.info(`[firebase] emulators wired: auth=${host}:${authPort} firestore=${host}:${firestorePort}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[firebase] failed to connect emulators', err);
  }
}

// FCM messaging — only initialized if browser supports it
let messaging = null;
isSupported().then(supported => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export const getMessagingInstance = () => messaging;
export { auth, db };
