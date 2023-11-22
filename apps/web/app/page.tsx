"use client";

import { areWeThereYet } from "@mono/common";
import { add, multiply, reset } from "~/lib/api.js";
import CardWithAction from "./components/card-with-action.jsx";
import { CounterView } from "./components/counter-view.jsx";

export default function Home() {
  return (
    <main className={"flex flex-col justify-between gap-10 p-10"}>
      <h1 className={"text-xl"}>A quest for the ideal TS monorepo setup</h1>

      <div className="grid grid-cols-2 gap-4">
        <CardWithAction
          title="Are we there yet? "
          description={areWeThereYet()}
        />
        <CardWithAction
          title="Remote Counter"
          description="Implemented by mutating a Firestore document. Mutations will be slow as they flow through an API call and logic triggered by document onWrite events. Also, Firestore documents have a 1 write/sec limitation and so triggering mutations quickly could cause lagging or errors. This setup is aimed at integrating two separate Firebase services, and is not an example of how you would implement a reliable mechanism."
          action={{ label: "Reset", handler: () => reset() }}
        >
          <CounterView counterId="my_counter" />
        </CardWithAction>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CardWithAction
          title="Addition"
          description="Increments the counter value"
          action={{ label: "Add 3", handler: () => add(3) }}
        />

        <CardWithAction
          title="Multiplication"
          description="Multiplies the counter value"
          action={{ label: "Multiply by 2", handler: () => multiply(2) }}
        />
      </div>
    </main>
  );
}
