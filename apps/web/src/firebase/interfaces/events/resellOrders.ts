import type { Timestamp } from "@firebase/firestore";

export type ResellOrder = {
  userId: string;
  eventId: string;
  ticketId: string;
  status: string;
  total: number;
  bankName: string;
  bankAccountType: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankAccountDni: string;
  bankAccountEmail: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  ticketName: string;
  orderPriority: number;
  eventName: string;
};

export type ResellOrderWithId = ResellOrder & {
  id: string;
};
