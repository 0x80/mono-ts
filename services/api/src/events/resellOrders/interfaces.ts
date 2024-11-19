import type { Timestamp } from "firebase-admin/firestore";

export type ResellOrder = {
  userId: string;
  eventId: string;
  userName: string;
  userEmail: string;
  ticketId: string;
  newTicketRef: string;
  status: string;
  earning: number;
  deltaEarning: number;
  total: number;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankAccountDni: string;
  bankAccountEmail: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  ticketName: string;
  orderPriority: number;
  eventName: string;
  eventImageUrl: string;
  orderId: string;
};

export type ResellOrderWithId = ResellOrder & {
  id: string;
};
