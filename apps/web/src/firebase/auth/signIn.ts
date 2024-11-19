import firebase_app from "../config";
import {
  signInWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import type { User } from "firebase/auth";
const auth = getAuth(firebase_app);

export const signIn: (
  email: string,
  password: string
) => Promise<User | null> = async (email: string, password: string) => {
  try {
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user.user;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const signInWithGoogle: () => Promise<User | null> = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.log(error);
    return null;
  }
};
