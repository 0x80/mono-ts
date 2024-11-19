import {
  collection,
  collectionGroup,
  type DocumentData,
  type QueryDocumentSnapshot,
  type PartialWithFieldValue,
  type FirestoreDataConverter,
  getFirestore,
} from "@firebase/firestore";
import firebase_app from "../config";
import type { Event } from "../interfaces/events";
import type { User } from "../interfaces/users";
import type { Producer } from "../interfaces/producers";
import type { ResellOrder } from "../interfaces/events/resellOrders"; // Assuming you have this interface defined
import type { Order } from "../interfaces/order";
import type { EventStatsCollection } from "../interfaces/events/stats";
import type { Blog } from "../interfaces/blogs";

export const firestore = getFirestore(firebase_app);

const converter = <T>(): FirestoreDataConverter<T> => ({
  toFirestore: (data: PartialWithFieldValue<T>) => data as DocumentData,
  fromFirestore: (snap: QueryDocumentSnapshot<DocumentData>) =>
    snap.data() as T,
});

const dataPoint = <T>(collectionPath: string) => {
  return collection(firestore, collectionPath).withConverter(converter<T>());
};

// Function to get a sub-collection
const subCollection = <T>(
  parentCollectionPath: string,
  subCollectionName: string
) => {
  return collection(
    firestore,
    `${parentCollectionPath}/${subCollectionName}`
  ).withConverter(converter<T>());
};

// Function to get a collection group
const collectionGroupPoint = <T>(collectionGroupName: string) => {
  return collectionGroup(firestore, collectionGroupName).withConverter(
    converter<T>()
  );
};

const db = {
  events: dataPoint<Event>("events"),
  users: dataPoint<User>("users"),
  producers: dataPoint<Producer>("producers"),
  orders: dataPoint<Order>("orders"),
  blogs: dataPoint<Blog>("blogs"),
  // Resell orders sub-collection of events
  resellOrders: (eventId: string) =>
    subCollection<ResellOrder>(`events/${eventId}`, "resellOrders"),
  stats: (eventId: string) =>
    subCollection<EventStatsCollection>(`events/${eventId}`, "stats"),
  // Collection group reference for resell orders
  resellOrdersGroup: collectionGroupPoint<ResellOrder>("resellOrders"),
};

export default db;
