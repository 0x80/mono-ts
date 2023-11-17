import { invariant } from "@mono/common";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { refs } from "~/refs";

export function CounterView() {
  const [counter, isLoading] = useDocumentData(
    doc(refs.counters, "my_counter")
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  invariant(counter, "Missing counter data");

  if (counter) {
    return <div>Counter: {JSON.stringify(counter)}</div>;
  } else {
    return <div>No such document!</div>;
  }
}
