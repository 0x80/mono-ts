"use client";

import { areWeThereYet } from "@mono/common";
import { add, multiply, reset } from "~/lib/api.js";
import { CounterView } from "./components/counter-view.jsx";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>A quest for the ideal TS monorepo setup</h1>
      <div className={styles.description}>
        <p>Are we there yet? {areWeThereYet()}</p>
      </div>
      <CounterView />
      <div className={styles.description}>
        <button className={styles.button} onClick={() => reset()}>
          Reset
        </button>
        <button className={styles.button} onClick={() => add(3)}>
          Increment by 3
        </button>
        <button className={styles.button} onClick={() => multiply(2)}>
          Multiply by 2
        </button>
      </div>
    </main>
  );
}
