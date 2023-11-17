"use client";

import { add, multiply, reset } from "~/lib/api";
import { CounterView } from "./components/counter-view";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>app/page.tsx</code>
        </p>
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