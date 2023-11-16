import { Counter, getErrorMessage } from "@mono/common";
import { Request, Response } from "express";
import {
  getDocument,
  incrementField,
  serverTimestamp,
} from "firestore-server-utils";
import { refs } from "~/refs.js";
import { PostRequest } from "~/types.js";

interface Payload {
  value: number;
}

export async function reset(_req: Request, res: Response) {
  await refs.counters.doc("my_counter").set({
    value: 0,
    mutation_count: 0,
    mutated_at: serverTimestamp(),
    is_flagged: false,
  } satisfies Counter);

  res.status(200).end();
}

export async function add(req: PostRequest<Payload>, res: Response) {
  try {
    const { value } = req.body;

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    await counter.ref.update({
      value: incrementField(value),
    } satisfies Partial<Counter>);

    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
}

export async function multiply(req: PostRequest<Payload>, res: Response) {
  try {
    const { value } = req.body;

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    await counter.ref.update({
      value: counter.data.value * value,
    } satisfies Partial<Counter>);

    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
}
