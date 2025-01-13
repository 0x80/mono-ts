import type { UpdateData, WithFieldValue } from "@google-cloud/firestore";
import type { Counter } from "@repo/common";
import { getErrorMessage } from "@repo/common";
import { startTimer } from "@repo/core/utils";
import { FieldValue } from "firebase-admin/firestore";
import { getDocument } from "firestore-server-utils";
import type { Context } from "hono";
import { z } from "zod";
import { refs } from "~/refs";

export async function reset(_c: Context) {
  await refs.counters.doc("my_counter").set({
    value: 0,
    mutation_count: 0,
    mutated_at: FieldValue.serverTimestamp(),
    is_flagged: false,
  } satisfies WithFieldValue<Counter>);

  return new Response(null, { status: 200 });
}

const AddPayload = z.object({
  n: z.number(),
});

export async function add(c: Context) {
  try {
    const [point, end] = startTimer("add");

    const { n } = AddPayload.parse(await c.req.json());

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    point("Got document");

    await counter.ref.update({
      value: FieldValue.increment(n),
    } satisfies UpdateData<Counter>);

    point("Updated document");

    end();
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(getErrorMessage(err), { status: 500 });
  }
}

const MultiplyPayload = z.object({
  n: z.number(),
});

export async function multiply(c: Context) {
  try {
    const [point, end] = startTimer("multiply");

    const { n } = MultiplyPayload.parse(await c.req.json());

    const counter = await getDocument<Counter>(refs.counters, "my_counter");

    point("Got document");

    await counter.ref.update({
      value: counter.data.value * n,
    } satisfies UpdateData<Counter>);

    point("Updated document");

    end();
    return new Response(null, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(getErrorMessage(err), { status: 500 });
  }
}
