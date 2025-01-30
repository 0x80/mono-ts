import type { Timestamp } from "firebase-admin/firestore";

declare global {
  type FsTimestamp = Timestamp;
}
