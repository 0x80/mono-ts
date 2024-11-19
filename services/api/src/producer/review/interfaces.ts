import type { Timestamp } from "firebase-admin/firestore";

export type ProducerReview = {
  eventId: string;
  eventName: string;
  eventImage: string;
  userId: string;
  userName: string;
  userMail: string;
  rating: number;
  createdAt?: Timestamp;
  producerId: string;
};
