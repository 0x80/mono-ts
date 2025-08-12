import { useDocumentMaybe } from "@typed-firestore/react";
import { refs } from "~/db-refs";
import KeyValueList from "./key-value-list";

export function CounterView(props: { counterId: string }) {
  /**
   * Note that counter is typed correctly here by `@typed-firestore/react` ✨
   *
   * Typically you would use useDocument much more often than useDocumentMaybe,
   * but because we run this in the emulator without initializing data, the
   * counter might initially not exist.
   */
  const [counter, isLoading] = useDocumentMaybe(refs.counters, props.counterId);

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
    return (
      <div>No counter document available. Please press &quot;reset&quot;.</div>
    );
  }
}
