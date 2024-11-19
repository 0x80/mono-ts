import firebase_app from "../config";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

const app = getAuth(firebase_app);

export const signUp = async (email: string, password: string) => {
  try {
    const user = await createUserWithEmailAndPassword(app, email, password);
    return user;
  } catch (error) {
    return error;
  }
};
