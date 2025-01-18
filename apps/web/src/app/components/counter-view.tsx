import { useDocument } from "@typed-firestore/react";
import { refs } from "~/db-refs";
import KeyValueList from "./key-value-list";

export function CounterView(props: { counterId: string }) {
  /** Note that counter is typed correctly here by `@typed-firestore/react` ✨ */
  const [counter, isLoading] = useDocument(refs.counters, props.counterId);

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
