import { collection } from "firebase/firestore";
import { db } from "~/lib/firebase";

console.log("+++ db", db);
export const refs = {
  counters: collection(db, "counters"),
};
