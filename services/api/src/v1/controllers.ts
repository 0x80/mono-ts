import { Counter, getErrorMessage } from "@mono/common";
import { Request, Response } from "express";
import {
  getDocument,
  incrementField,
  serverTimestamp,
} from "firestore-server-utils";
import { refs } from "~/refs.js";

export async function reset(_req: Request, res: Response) {
  await refs.counters.doc("my_counter").set({
    value: 0,
    mutation_count: 0,
    mutated_at: serverTimestamp(),
    is_flagged: false,
  } satisfies Counter);

  res.status(200).end();
}

import { z } from "zod";

const AddPayload = z.object({
  n: z.number(),
});

export async function add(req: Request, res: Response) {
  try {
    const { n } = AddPayload.parse(req.body);

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    await counter.ref.update({
      value: incrementField(n),
    } satisfies Partial<Counter>);

    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
}

const MultiplyPayload = z.object({
  n: z.number(),
});

export async function multiply(req: Request, res: Response) {
  try {
    const { n } = MultiplyPayload.parse(req.body);

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    await counter.ref.update({
      value: counter.data.value * n,
    } satisfies Partial<Counter>);

    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
}
