import {
  type DocumentData,
  onSnapshot,
  query,
  where,
  type QuerySnapshot,
  orderBy,
  doc,
  updateDoc,
} from "@firebase/firestore";
import db from "../utils";

export const streamApprovedResellOrders = (
  snapshot: (snapshot: QuerySnapshot<DocumentData>) => void,
  error?: () => void
) => {
  const resellOrdersGroupRef = db.resellOrdersGroup;
  const resellOrdersQuery = query(
    resellOrdersGroupRef,
    where("status", "!=", "Pending"),
    orderBy("orderPriority", "desc"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(resellOrdersQuery, snapshot, error);
};

export const updateStatusResellOrder = async (
  eventId: string,
  resellOrderId: string,
  status: string,
  orderPriority: number
) => {
  const resellOrderRef = doc(db.resellOrders(eventId), resellOrderId);
  await updateDoc(resellOrderRef, { status, orderPriority });
};
