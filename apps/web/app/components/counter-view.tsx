import type { Counter } from "@repo/common";
import { doc } from "firebase/firestore";
import { useTypedDocument } from "~/lib/firestore.js";
import { refs } from "~/refs.js";
import KeyValueList from "./key-value-list.jsx";

export function CounterView(props: { counterId: string }) {
  const [counter, isLoading] = useTypedDocument<Counter>(
    doc(refs.counters, props.counterId)
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (counter) {
    return (
      <KeyValueList
        data={counter.data}
        labels={[
          ["value", "Current Value"],
          ["mutation_count", "Mutation Count"],
          ["mutated_at", "Last mutated at"],
        ]}
      />
    );
  } else {
    return <div>No counter document available. Please press "reset".</div>;
  }
}
