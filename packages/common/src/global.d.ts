import type { Timestamp } from "firebase/firestore";

declare global {
  type FsTimestamp = Timestamp;
}
