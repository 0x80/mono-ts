/** This file contains Firestore document types */

import type { Timestamp } from "firebase/firestore";

/**
 * The firebase-admin SDK 11 contains a Timestamp definition without a toJSON
 * method, so in order to freely share the document type definitions between
 * client and server code, we need to omit the toJSON method.
 */
export type FsTimestamp = Omit<Timestamp, "toJSON">;

export type Counter = {
  value: number;
  mutated_at: FsTimestamp;
  mutation_count: number;
  is_flagged: boolean;
};
