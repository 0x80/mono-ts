import type { Counter } from "@repo/common";
import { doc } from "firebase/firestore";
import { useTypedDocument } from "~/lib/firestore";
import { refs } from "~/refs";
import KeyValueList from "./key-value-list";

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
