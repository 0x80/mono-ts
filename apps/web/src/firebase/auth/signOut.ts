import firebase_app from "../config";
import { getAuth, signOut } from "firebase/auth";

const app = getAuth(firebase_app);

export const signOutHandler = async () => {
  try {
    await signOut(app);
  } catch (error) {
    return error;
  }
};
