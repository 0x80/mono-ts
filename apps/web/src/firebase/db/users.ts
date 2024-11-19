import {
  doc,
  type DocumentData,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  type QuerySnapshot,
  where,
} from "@firebase/firestore";
import db from "./utils";

export const streamUsers = (
  snapshot: (snapshot: QuerySnapshot<DocumentData, DocumentData>) => void,
  error?: () => void
) => {
  const itemsColRef = db.users;

  return onSnapshot(itemsColRef, snapshot, error);
};

export const getUser = async (userId: string) => {
  const userDoc = await getDoc(doc(db.users, userId));
  return userDoc.data() || null;
};

export const streamUser = (
  userId: string,
  snapshot: (snapshot: DocumentData) => void,
  error?: () => void
) => {
  const userDocRef = doc(db.users, userId);
  console.log(userDocRef);

  return onSnapshot(userDocRef, snapshot, error);
};

export const streamUserProducersEvents = (
  producersIds: string[],
  snapshot: (snapshot: QuerySnapshot<DocumentData, DocumentData>) => void,
  error?: () => void
) => {
  const itemsColRef = query(
    db.events,
    where("producer.id", "in", producersIds),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(itemsColRef, snapshot, error);
};
