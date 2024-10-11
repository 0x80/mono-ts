import type { UpdateData, WithFieldValue } from "@google-cloud/firestore";
import { startTimer } from "@repo/backend/utils";
import type { Counter } from "@repo/common";
import { getErrorMessage } from "@repo/common";
import type { Request, Response } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { getDocument } from "firestore-server-utils";
import { z } from "zod";
import { refs } from "~/refs";

export async function reset(_req: Request, res: Response) {
  await refs.counters.doc("my_counter").set({
    value: 0,
    mutation_count: 0,
    mutated_at: FieldValue.serverTimestamp(),
    is_flagged: false,
  } satisfies WithFieldValue<Counter>);

  res.status(200).end();
}

const AddPayload = z.object({
  n: z.number(),
});

export async function add(req: Request, res: Response) {
  try {
    /** Test sharing code from packages/backend */
    const [point, end] = startTimer("add");

    const { n } = AddPayload.parse(req.body);

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    point("Got document");

    await counter.ref.update({
      value: FieldValue.increment(n),
    } satisfies UpdateData<Counter>);

    point("Updated document");

    res.status(200).end();

    end();
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
    /** Test sharing code from packages/backend */
    const [point, end] = startTimer("multiply");

    const { n } = MultiplyPayload.parse(req.body);

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    point("Got document");

    await counter.ref.update({
      value: counter.data.value * n,
    } satisfies UpdateData<Counter>);

    point("Updated document");

    res.status(200).end();

    end();
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
}
