import type { Timestamp } from "firebase-admin/firestore";

export type User = {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  email: string;
  display_name: string;
  firstName: string;
  lastName: string;
  dni: string;
  dniType: string;
  country: string;
  role: string;
  isPublic: boolean;
  followersCount: number;
  followingCount: number;
  uid: string;
  neoId?: string;
  transbank?: {
    tbkUser: string;
    cardNumber: string;
    cardType: string;
  };
  bank: {
    bankAccountType: string;
    bankAccountNumber: string;
    bankAccountName: string;
    bankAccountDni: string;
    bankAccountEmail: string;
    bankName: string;
  };
  subscriptions?: { name: string; id: string }[];
  producers: { id: string; name: string }[];
  pendingReviews?: {
    eventId: string;
    eventName: string;
    producerId: string;
    eventImage: string;
  }[];
  photo_url?: string;
};

export type UserWithId = User & {
  id: string;
};
