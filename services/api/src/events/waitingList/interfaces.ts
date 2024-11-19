import type { Timestamp } from "firebase-admin/firestore";

export type WaitingList = {
  userId: string;
  createdAt?: Timestamp;
  userMail: string;
  userName: string;
  eventId: string;
  eventName: string;
  eventStart: Timestamp | string;
};
