import type { DocumentReference } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";

type FsDocument<T> = {
  id: string;
  data: T;
  ref: DocumentReference;
};

export function useTypedDocument<T>(
  ref: DocumentReference
): [FsDocument<T> | undefined, boolean] {
  const [snapshot, isLoading, error] = useDocument(ref);

  if (error) {
    throw error;
  }

  const doc = snapshot?.exists()
    ? { id: snapshot.id, data: snapshot.data() as T, ref: snapshot.ref }
    : undefined;

  return [doc, isLoading];
}
