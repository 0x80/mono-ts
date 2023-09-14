import { assert } from "@mono/common";

export interface Document<T> {
  id: string;
  data: T;
  ref: FirebaseFirestore.DocumentReference;
}

export interface ExtendedDocument<T> extends Document<T> {
  createTime: FirebaseFirestore.Timestamp;
  updateTime: FirebaseFirestore.Timestamp;
}

export async function getDocument<T>(
  ref: FirebaseFirestore.DocumentReference
): Promise<Document<T>> {
  const doc = await ref.get();

  assert(doc.exists, `Failed to find document at path ${ref.path}`);

  return { id: doc.id, data: doc.data() as T, ref: doc.ref };
}

export async function getDocumentPossibly<T>(
  ref: FirebaseFirestore.DocumentReference
): Promise<Document<T> | undefined> {
  const doc = await ref.get();

  if (!doc.exists) return;

  return { id: doc.id, data: doc.data() as T, ref: doc.ref } as Document<T>;
}

export async function getDocumentFromTransaction<T>(
  transaction: FirebaseFirestore.Transaction,
  ref: FirebaseFirestore.DocumentReference
) {
  const doc = await transaction.get(ref);

  assert(doc.exists, `No document available at path ${ref.path}`);

  return { id: doc.id, data: doc.data() as T, ref: doc.ref } as Document<T>;
}

export async function getDocumentPossiblyFromTransaction<T>(
  transaction: FirebaseFirestore.Transaction,
  ref: FirebaseFirestore.DocumentReference
) {
  const doc = await transaction.get(ref);

  if (!doc.exists) return;

  return { id: doc.id, data: doc.data() as T, ref: doc.ref } as Document<T>;
}
