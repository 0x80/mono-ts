import type { Counter } from "@repo/common";
import type { CollectionReference } from "firebase-admin/firestore";
import { db } from "./firebase";

/**
 * Here we defined reusable references to collections and type each of them so
 * that functions from `@typed-firestore/server` can infer the types
 * automatically for us.
 *
 * This file is located on @repo/core so all backend services can share this.
 *
 * @todo See if it is compatible with web SDK
 */
export const refs = {
  counters: db.collection("counters") as CollectionReference<Counter>,
};
