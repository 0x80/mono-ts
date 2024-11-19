import type { Timestamp } from "firebase-admin/firestore";

export enum TicketStatus {
  Active = "Active",
  Pending = "Pending",
  Reselling = "Reselling",
  Reselled = "Reselled",
  Validated = "Validated",
}

export type Ticket = {
  eventId: string;
  eventName: string;
  eventImageUrl: string;
  eventStart: Timestamp | null;
  eventEnd: Timestamp | null;
  eventActivationDate: Timestamp | null;
  locationName: string;
  address: string;
  name: string;
  userId: string;
  userMail: string;
  userName: string;
  userDni: string;
  status: TicketStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  validatedAt?: Timestamp;
  price: number;
  date: string;
  hour: number;
  isConcurrent: boolean;
  resellRef?: string;
  orderId: string;
  producerId: string;
  type: string;
  description: string;
  metadata?:
    | { [key: string]: string }
    | { [key: string]: { [key: string]: string } };
  channel: string;
  resellable: boolean;
};
