import type { Timestamp } from "firebase-admin/firestore";

export type ProducerRating = {
  ratingPoint: number;
  ratingTotal: number;
  ratingNumber: number;
};

export type Producer = {
  image: string;
  name: string;
  backgroundImage: string;
  description: string;
  instagramProfile: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  users: { id: string; email: string };
  domains: string[];
  ratings: ProducerRating;
};
