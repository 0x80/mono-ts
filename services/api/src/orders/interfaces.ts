import type admin from "firebase-admin";
import type { Timestamp } from "firebase-admin/firestore";

export enum OrderStatus {
  Rejected = "Rejected",
  Approved = "Approved",
  Expired = "Expired",
  Pending = "Pending",
}

export type Order = {
  totalSelled: number;
  totalWithServiceFeeSelled: number;
  serviceFeeSelled: number;
  userId: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
  items: OrderItem[];
  status: OrderStatus;
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
  itemCount: number;
  eventProducer: string;
  eventProducerId: string;
  isConcurrent: boolean;
  orderId: string;
  taskId?: string;
  resellable?: boolean;
  floid?: {
    payment_url: string;
    payment_token: string;
  };
  webPay?: {
    payment_url: string;
    payment_token: string;
  };
  khipu?: {
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
  metadata?: { [key: string]: { [key: string]: string } };
  deviceType: string;
  expirationDate: string;
  serviceFeeHidden: boolean;
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
  serviceFee: number;
};
