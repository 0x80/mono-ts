import { collection } from "firebase/firestore";
import { db } from "~/lib/firebase";

export const refs = {
  counters: collection(db, "counters"),
};
