import type { Timestamp } from "firebase/firestore";

export type User = {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  dniType: string;
  country: string;
  role: string;
  producers?: { name: string; id: string }[];
  display_name: string;
};

export type UserWithId = User & {
  id: string;
};
