import * as functions from "firebase-functions";
// import { updateNeoUser } from "..";

export const onUpdateUser = () => {
  return functions.firestore.onDocumentUpdated(
    "users/{userId}",
    async (event) => {
      functions.logger.info("Checking resell status");
      const user = event.data;
      if (!user) {
        functions.logger.error("Document does not exist");
        return;
      }
      try {
        if (
          user.before.data().display_name != user.after.data().display_name ||
          user.before.data().photo_url != user.after.data().photo_url ||
          user.before.data().isPublic != user.after.data().isPublic
        ) {
          // await updateNeoUser(
          //   user.after.id,
          //   user.after.data().display_name,
          //   user.after.data().photo_url ?? "",
          //   user.after.data().email,
          //   user.after.data().isPublic ?? true
          // );
        }
      } catch (error) {
        console.error(error);
      }
    }
  );
};
