import type { Timestamp } from "firebase-admin/firestore";

export type FollowRequest = {
  userId: string;
  createdAt?: Timestamp;
  userName: string;
  status: string;
};
