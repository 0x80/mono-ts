"use client";

import { areWeThereYet } from "@repo/common";
import { CardDescription } from "~/components/ui/card";
import { add, multiply, reset } from "~/lib/api";
import CardWithAction from "./components/card-with-action.tsx";
import { CounterView } from "./components/counter-view.tsx";

export default function Home() {
  return (
    <main className={"flex flex-col justify-between gap-10 p-10"}>
      <h1 className={"text-xl"}>A quest for the ideal TS monorepo</h1>

      <div className="grid grid-cols-2 gap-4">
        <CardWithAction
          title="Are we there yet? "
          description={areWeThereYet()}
        >
          <CardDescription>
            To test live updates to the backend services while the emulator is
            running, you can update code in{" "}
            <code className="text-zinc-800">
              services/api/src/v1/handlers.ts
            </code>
            . For example change the multiplication{" "}
            <code className="text-zinc-800">counter.data.value * n</code> to{" "}
            <code className="text-zinc-800">counter.data.value * n * 10</code>
          </CardDescription>
        </CardWithAction>
        <CardWithAction
          title="Dodgy Counter"
          description="Implemented using a Firestore document. Mutations flow through an API endpoint and logic triggered by document onWrite events. In the emulator it works without noticeable lag but in real life it does not. This is a contrived example, aimed at demonstrating two separate Firebase services. It is not an illustration of how to implement an efficient and reliable mechanism."
          action={{ label: "Reset", handler: () => void reset() }}
        >
          <CounterView counterId="my_counter" />
        </CardWithAction>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CardWithAction
          title="Addition"
          description="Increments the counter value"
          action={{ label: "Add 3", handler: () => void add(3) }}
        />

        <CardWithAction
          title="Multiplication"
          description="Multiplies the counter value"
          action={{ label: "Multiply by 2", handler: () => void multiply(2) }}
        />
      </div>
    </main>
  );
}
