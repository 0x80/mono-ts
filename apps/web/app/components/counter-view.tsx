"use client";

import { Counter, getErrorMessage, invariant } from "@mono/common";
import { CollectionReference, doc } from "firebase/firestore";
import { FsDocument, makeFsDocument } from "firestore-hooks";
import { useDocument } from "react-firebase-hooks/firestore";
import { refs } from "~/refs";

export function useDocumentY<T>(
  collectionRef: CollectionReference,
  documentId?: string
): [FsDocument<T> | undefined, boolean] {
  const [snapshot, isLoading, error] = useDocument(
    documentId ? doc(collectionRef, documentId) : undefined
  );

  if (error) {
    throw new Error(
      `Failed to use document from ${
        collectionRef.path
      }/${documentId}: ${getErrorMessage(error)}`
    );
  }

  return [
    snapshot?.exists() ? makeFsDocument<T>(snapshot) : undefined,
    isLoading,
  ];
}

export function CounterView() {
  // const [counter, isLoading] = useDocumentX<Counter>(
  //   doc(refs.counters, "my_counter")
  // );

  const [counter, isLoading] = useDocumentY<Counter>(
    refs.counters,
    "my_counter"
  );

  // const [counter, isLoading] = useDocumentZ§<Counter>(
  //   refs.counters,
  //   "my_counter"
  // );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  invariant(counter, "Missing counter data");

  if (counter) {
    return <div>Counter: {JSON.stringify(counter.data)}</div>;
  } else {
    return <div>No such document!</div>;
  }
}
