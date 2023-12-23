import { areWeThereYet, type Counter } from "@repo/common";
import functions from "firebase-functions";
import { incrementField, serverTimestamp } from "firestore-server-utils";
import { counterFlagThreshold, region } from "~/config.js";

/**
 * This is a bit of a contrived example, and by no means a demonstration of
 * solid production grade code.
 */
export const countersOnWrite = functions
  .region(region)
  .firestore.document("counters/{documentId}")
  .onWrite(async (change) => {
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

    /** Just a test to link something from common */
    console.log(areWeThereYet());

    const updateData: Partial<Counter> = {
      mutated_at: serverTimestamp(),
      mutation_count: incrementField(1),
    };

    if (after.value < counterFlagThreshold && after.is_flagged) {
      updateData.is_flagged = false;
    } else if (after.value >= counterFlagThreshold && !after.is_flagged) {
      updateData.is_flagged = true;
    }

    await change.after.ref.update(updateData);
  });
