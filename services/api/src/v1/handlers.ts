import { getErrorMessage } from "@repo/common";
import { refs } from "@repo/core/db-refs";
import { startTimer } from "@repo/core/utils";
import { getDocument, setDocument } from "@typed-firestore/server";
import type { Request, Response } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";

export async function reset(_req: Request, res: Response) {
  await setDocument(refs.counters, "my_counter", {
    value: 0,
    mutation_count: 0,
    mutated_at: FieldValue.serverTimestamp(),
    is_flagged: false,
  });

  res.status(200).end();
}

const AddPayload = z.object({
  n: z.number(),
});

export async function add(req: Request, res: Response) {
  try {
    /** Test sharing code from packages/core */
    const [point, end] = startTimer("add");

    const { n } = AddPayload.parse(req.body);

    const counter = await getDocument(refs.counters, "my_counter");

    point("Got document");

    /** Note that `@typed-firestore/server` provides the typed update method ✨ */
    await counter.update({
      value: FieldValue.increment(n),
    });

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
    /** Test sharing code from packages/core */
    const [point, end] = startTimer("multiply");

    const { n } = MultiplyPayload.parse(req.body);

    const counter = await getDocument(refs.counters, "my_counter");

    point("Got document");

    /** Note that `@typed-firestore/server` provides the typed update method ✨ */
    await counter.update({
      value: counter.data.value * n,
    });

    point("Updated document");

    res.status(200).end();

    end();
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
}
