/**
 * This file contains Firestore document types
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Just a convenience type for casting. You should probably  use the new
 * WithFieldValue instead.
 */
export type FirestoreTimestamp = Timestamp;

export type Counter = {
  value: number;
  mutated_at: number;
  mutation_count: number;
};
