import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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

// FCM messaging — only initialized if browser supports it
let messaging = null;
isSupported().then(supported => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export const getMessagingInstance = () => messaging;
export { auth, db };
