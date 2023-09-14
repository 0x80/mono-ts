// Import the functions you need from the SDKs you need

import { getRequiredEnvValue } from "@mono/common";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: getRequiredEnvValue("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getRequiredEnvValue("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getRequiredEnvValue("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getRequiredEnvValue("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getRequiredEnvValue(
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  ),
  appId: getRequiredEnvValue("NEXT_PUBLIC_FIREBASE_APP_ID"),
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
