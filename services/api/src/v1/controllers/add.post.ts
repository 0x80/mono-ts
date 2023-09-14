import { FieldValue, db, serverTimestamp } from "@mono/backend/firebase";
import { getDocumentPossibly } from "@mono/backend/firestore";
import { Counter, getErrorMessage } from "@mono/common";
import { Response } from "express";
import { TypedRequest } from "~/types.js";

interface Payload {
  value: number;
}

export async function addPost(req: TypedRequest<Payload>, res: Response) {
  try {
    const { value } = req.body;

    const counter = await getDocumentPossibly<Counter>(
      db.collection("counters").doc("my_counter")
    );

    if (counter) {
      const newValue = counter.data.value + value;

      await counter.ref.update({
        value: newValue,
        mutated_at: serverTimestamp(),
        mutation_count: FieldValue.increment(1),
      });

      return res.json({
        new_value: newValue,
        modified_at: serverTimestamp(),
      });
    } else {
      await db.collection("counters").doc("my_counter").set({
        value,
        mutated_at: serverTimestamp(),
        mutation_count: 1,
      });

      return res.json({
        new_value: value,
        modified_at: serverTimestamp(),
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send(getErrorMessage(err));
  }
}
