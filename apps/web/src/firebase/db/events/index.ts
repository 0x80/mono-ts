import {
  doc,
  type DocumentData,
  onSnapshot,
  orderBy,
  query,
  type QuerySnapshot,
} from "@firebase/firestore";
import db from "../utils";

export const streamEvents = (
  snapshot: (
    snapshot: QuerySnapshot<DocumentData, DocumentData>
  ) => void | Promise<void>,
  error?: () => void
) => {
  const itemsColRef = db.events;
  const q = query(itemsColRef, orderBy("updatedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      snapshot(snap);
    },
    error
  );
};

export const streamEvent = (
  eventId: string,
  snapshot: (snapshot: DocumentData) => void | Promise<void>,
  error?: () => void
) => {
  const eventDocRef = doc(db.events, eventId);
  return onSnapshot(
    eventDocRef,
    (snap) => {
      snapshot(snap);
    },
    error
  );
};
