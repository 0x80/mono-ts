import {
  type DocumentData,
  onSnapshot,
  orderBy,
  query,
  type QuerySnapshot,
} from "@firebase/firestore";
import db from "./utils";

export const streamBlogs = (
  snapshot: (snapshot: QuerySnapshot<DocumentData, DocumentData>) => void,
  error?: () => void
) => {
  const itemsColRef = db.blogs;
  const q = query(itemsColRef, orderBy("updatedAt", "desc"));
  return onSnapshot(q, snapshot, error);
};
