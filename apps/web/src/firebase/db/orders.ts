import {
  type DocumentData,
  onSnapshot,
  query,
  where,
} from "@firebase/firestore";
import db from "./utils";

export const streamEventOrders = (
  eventId: string,
  snapshot: (snapshot: DocumentData) => void,
  error?: () => void
) => {
  const queryProducers = query(
    db.orders,
    where("eventId", "==", eventId),
    where("status", "==", "Approved")
  );

  return onSnapshot(queryProducers, snapshot, error);
};
