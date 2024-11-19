import type { Timestamp } from "@firebase/firestore";

export type Order = {
  totalSelled: number;
  totalWithServiceFeeSelled: number;
  serviceFeeSelled: number;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  items: OrderItem[];
  status: string;
  eventId: string;
  userName: string;
  eventName: string;
  eventEndDate: Timestamp;
  eventStartDate: Timestamp;
  eventActivationDate: Timestamp;
  hasActivationDate: boolean;
  eventLocationAddress: string;
  eventImageUrl: string;
  eventLocationName: string;
  userMail: string;
  userDni: string;
  eventProducer: string;
  eventProducerId: string;
  isConcurrent: boolean;
  orderId: string;
  taskId?: string;
  floid: {
    payment_url: string;
    payment_token: string;
  };
  channel: string;
  date: string;
  hour: number;
  qrInfos?: {
    ticketId: string;
    name: string;
    url: string;
  }[];
  isEventActivated: boolean;
  producerId: string;
  metadata?: { [key: string]: string };
};

export type OrderItem = {
  name: string;
  price: number;
  type: string;
  quantity: number;
  ids: string[];
  normalCount: number;
  resellingCount: number;
  description: string;
};
