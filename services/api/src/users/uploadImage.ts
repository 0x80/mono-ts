import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { uploadImageToStorageResize } from "../storage/uploadImage";
import { v4 as uuidv4 } from "uuid";
import type { CallableRequest } from "firebase-functions/https";
export type Data = {
  image: string;
};

export const uploadUserImage = (
  db: admin.firestore.Firestore,
  storage: admin.storage.Storage
) => {
  return functions.https.onCall(
    { region: "southamerica-east1" },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { image } = data;

      const user = await db
        .collection("users")
        .doc(request.auth?.uid ?? "")
        .get();

      const url = await uploadImageToStorageResize({
        storage: storage,
        fileName: `users/${request.auth?.uid}-${uuidv4()}.jpg`,
        fileData: image,
        oldImageUrl: user.data()?.photo_url ?? "",
      });

      await db
        .collection("users")
        .doc(request.auth?.uid ?? "")
        .update({
          photo_url: url,
        })
        .then(async () => {
          await admin.auth().updateUser(request.auth?.uid ?? "", {
            photoURL: url,
          });
        });
    }
  );
};
