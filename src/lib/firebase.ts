import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAgPVnSpQBk0wyyIcO5dLKmfQ-ykmEcECs",
  authDomain: "smartbase-db9ac.firebaseapp.com",
  projectId: "smartbase-db9ac",
  storageBucket: "smartbase-db9ac.firebasestorage.app",
  messagingSenderId: "452301303890",
  appId: "1:452301303890:web:7623533e7f872a289bef8b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);