import { collection } from "firebase/firestore";
import { db } from "~/lib/firebase.js";

export const refs = {
  counters: collection(db, "counters"),
};
