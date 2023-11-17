import type { Counter } from "@mono/common";
import functions from "firebase-functions";
import { incrementField, serverTimestamp } from "firestore-server-utils";
import { counterFlagThreshold, region } from "~/config.js";

export const countersOnWrite = functions
  .region(region)
  .firestore.document("counters/{documentId}")
  .onWrite(async (change) => {
    const before = change.before.data() as Counter | undefined;
    const after = change.after.data() as Counter | undefined;

    if (!after) {
      return;
    }

    if (before && before.value === after.value) {
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

    const updateData: Partial<Counter> = {
      mutation_count: incrementField(1),
      mutated_at: serverTimestamp(),
    };

    if (after.value < counterFlagThreshold && after.is_flagged) {
      updateData.is_flagged = false;
    } else if (after.value >= counterFlagThreshold && !after.is_flagged) {
      updateData.is_flagged = true;
    }

    await change.after.ref.update(updateData);
  });
