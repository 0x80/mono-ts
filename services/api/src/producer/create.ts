import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { Producer } from "./interfaces";
import { uploadImageToStorageResize } from "../storage/uploadImage";
import type { CallableRequest } from "firebase-functions/https";

export const createProducer = (
  db: admin.firestore.Firestore,
  storage: admin.storage.Storage
) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Producer>) => {
      const { data } = request;
      functions.logger.info("Creating a producer", data);

      try {
        const imageUrl = await uploadImageToStorageResize({
          storage: storage,
          fileName: `producers/${data.name}.jpg`,
          fileData: data.image,
        });
        const backgroundImageUrl = await uploadImageToStorageResize({
          storage: storage,
          fileName: `producers/${data.name}_background.jpg`,
          fileData: data.backgroundImage,
        });
        const producerData: Producer = {
          ...data,
          image: imageUrl,
          backgroundImage: backgroundImageUrl,
          ratings: {
            ratingPoint: 0,
            ratingTotal: 0,
            ratingNumber: 0,
          },
        };
        await db.collection("producers").add({
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          ...producerData,
          users: [],
        });

        return {
          success: true,
          message: "Producer created successfully",
        };
      } catch (error) {
        if (error instanceof Error) {
          // Standard JavaScript error handling
          functions.logger.warn(error);
          return { success: false, message: error.message };
        } else {
          // If the error doesn't match the Error type, handle it generically
          functions.logger.warn("An unknown error occurred", error);
          return { success: false, message: "An unknown error occurred." };
        }
      }
    }
  );
};
