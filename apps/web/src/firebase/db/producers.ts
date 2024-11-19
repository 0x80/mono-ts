import {
  doc,
  type DocumentData,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
} from "@firebase/firestore";
import db from "./utils";

export const getAllProducers = () => {
  const itemsColRef = db.producers;
  const q = query(itemsColRef, orderBy("updatedAt", "desc"));
  return getDocs(q);
};

export const getProducer = async (producerId: string) => {
  const producerDocRef = doc(db.producers, producerId);
  return getDoc(producerDocRef);
};

export const streamProducer = (
  producerId: string,
  snapshot: (snapshot: DocumentData) => void | Promise<void>,
  error?: () => void
) => {
  const producerDocRef = doc(db.producers, producerId);

  return onSnapshot(
    producerDocRef,
    (snap) => {
      snapshot(snap);
    },
    error
  );
};

export const streamProducerUsers = (
  producer: { id: string; name: string },
  snapshot: (snapshot: DocumentData) => void,
  error?: () => void
) => {
  const queryProducers = query(
    db.users,
    where("producers", "array-contains", producer)
  );

  return onSnapshot(queryProducers, snapshot, error);
};
