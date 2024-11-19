import * as functions from "firebase-functions";
// import { deleteNeoEvent } from "..";

export const onDeleteEvent = () => {
  return functions.firestore.onDocumentDeleted(
    "events/{eventId}",
    async (event) => {
      try {
        // await deleteNeoEvent(event.id);
        return event;
      } catch (error) {
        console.error(error);
      }
    }
  );
};
