import type { Counter } from "@repo/common";
import { collection, type CollectionReference } from "firebase/firestore";
import { getFirestoreDb } from "~/lib/firebase";

/**
 * Here we define reusable references to collections and type each of them so
 * that functions from `@typed-firestore/react` can infer the types
 * automatically for us.
 *
 * Note that this file is slightly different from the one in `services/api`
 * because the backend types from firebase-admin are possibly not compatible.
 */
export const refs = {
  counters: collection(
    getFirestoreDb(),
    "counters",
  ) as CollectionReference<Counter>,
};
