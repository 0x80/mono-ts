/**
 * This file contains Firestore document types. The FsTimestamp is an alias
 * which is declared globally differently for server and client code, because
 * the Firestore SDKs have slightly incompatible types.
 */
export type Counter = {
  value: number;
  mutated_at: FsTimestamp;
  mutation_count: number;
  is_flagged: boolean;
};
