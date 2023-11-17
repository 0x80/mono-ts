/* eslint-disable react/no-unescaped-entities */
import { Counter } from "@mono/common";
import { doc } from "firebase/firestore";
import { useTypedDocument } from "~/lib/firestore";
import { refs } from "~/refs";

export function CounterView() {
  const [counter, isLoading] = useTypedDocument<Counter>(
    doc(refs.counters, "my_counter")
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (counter) {
    const { value, mutation_count, mutated_at } = counter.data;
    return (
      <ul>
        <li>Value: {value}</li>
        <li>Mutation count: {mutation_count}</li>
        <li>Mutated at: {mutated_at.toDate().toLocaleString()}</li>
      </ul>
    );
  } else {
    return <div>No counter document available. Please press "reset".</div>;
  }
}
