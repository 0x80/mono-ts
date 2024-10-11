import { startTimer } from "@repo/backend/utils";
import { areWeThereYet, type Counter } from "@repo/common";
import type { UpdateData } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import functions from "firebase-functions";
import { counterFlagThreshold, region } from "~/config";

/**
 * This is a bit of a contrived example, and by no means a demonstration of
 * solid production grade code.
 */
export const countersOnWrite = functions
  .region(region)
  .firestore.document("counters/{documentId}")
  .onWrite(async (change) => {
    /** Test sharing code from packages/backend */
    const [point, end] = startTimer("countersOnWrite");

    const before = change.before.data() as Counter | undefined;
    const after = change.after.data() as Counter | undefined;

    if (!after) {
      return;
    }

    if (before?.value === after.value || after.value === 0) {
      /**
       * This check is important, because otherwise the update below will
       * trigger an endless loop of onWrite events. Writing to the same document
       * from its onWrite handler is an anti-pattern. This code is only for demo
       * purposes.
       *
       * Firestore also have an official document update limit of 1 write per
       * second, so that's another reason to avoid this pattern.
       */
      return;
    }

    /** Test sharing code from packages/common */
    console.log(areWeThereYet());

    point("About to update document");

    const updateData: UpdateData<Counter> = {
      mutated_at: FieldValue.serverTimestamp(),
      mutation_count: FieldValue.increment(1),
    };

    if (after.value < counterFlagThreshold && after.is_flagged) {
      updateData.is_flagged = false;
    } else if (after.value >= counterFlagThreshold && !after.is_flagged) {
      updateData.is_flagged = true;
    }

    await change.after.ref.update(updateData);

    end();
  });
