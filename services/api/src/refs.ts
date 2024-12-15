/** Export collection references so we avoid repetition and typos */
import { db } from "@repo/core/firebase";

export const refs = {
  counters: db.collection("counters"),
};
