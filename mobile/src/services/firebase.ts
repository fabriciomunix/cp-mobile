import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// @ts-ignore
import firebaseConfig from '../../../firebaseConfig.json';

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
