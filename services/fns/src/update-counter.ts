import { areWeThereYet, type Counter } from "@repo/common";
import { startTimer } from "@repo/core/utils";
import type { UpdateData } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { counterFlagThreshold, region } from "~/config";

/**
 * This is a bit of a contrived example, and by no means a demonstration of how
 * to implement a counter efficiently.
 *
 * I tend to name v2 functions exports using snake_case because cloud run in CGP
 * overview will ignore casing.
 */
export const update_counter = onDocumentWritten(
  {
    document: "counters/{documentId}",
    region: region,
  },
  async (event) => {
    /** Test sharing code from packages/core */
    const [point, end] = startTimer("countersOnWrite");

    const before = event.data?.before.data() as Counter | undefined;
    const after = event.data?.after.data() as Counter | undefined;

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

    await event.data?.after.ref.update(updateData);

    end();
  }
);
