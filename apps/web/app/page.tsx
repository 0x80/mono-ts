"use client";

import { areWeThereYet } from "@mono/common";
import { add, multiply, reset } from "~/lib/api.js";
import CardWithAction from "./components/card-with-action.jsx";
import { CounterView } from "./components/counter-view.jsx";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>A quest for the ideal TS monorepo setup</h1>
      <div className={styles.description}>
        <p>Are we there yet? {areWeThereYet()}</p>
      </div>
      <div className={styles.description}>
        <CardWithAction
          title="Counter"
          description="A remote counter. Mutations are slow, because they flow via an API call and background functions, triggered by document onWrite events. This is just for demonstration and not an example of how you would want to implement an actual counter."
          action={{ label: "Reset", handler: () => reset() }}
        >
          <CounterView />
        </CardWithAction>
      </div>

      <div className={styles.description}>
        <CardWithAction
          title="Add"
          description="Increments the counter value"
          action={{ label: "3", handler: () => add(3) }}
        />

        <CardWithAction
          title="Multiply"
          description="Multiplies the counter value"
          action={{ label: "2", handler: () => multiply(2) }}
        />
      </div>
    </main>
  );
}
