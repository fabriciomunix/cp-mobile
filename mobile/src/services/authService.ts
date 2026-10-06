import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ChatUser } from '../../../shared/types';

export const registerUser = async (user: Omit<ChatUser, 'uid' | 'createdAt'>, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, user.email, password);
  const uid = userCredential.user.uid;
  
  const newUser: ChatUser = {
    ...user,
    uid,
    createdAt: Date.now()
  };

  await setDoc(doc(db, 'users', uid), newUser);
  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
