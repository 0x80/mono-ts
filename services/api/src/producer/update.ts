import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { Producer } from "./interfaces";
import { uploadImageToStorageResize } from "../storage/uploadImage";
import { uuid } from "uuidv4";
import type { CallableRequest } from "firebase-functions/https";

const uploadImageIfNeeded = async (
  imageData: string,
  storage: admin.storage.Storage,
  fileName: string,
  oldImageUrl: string
): Promise<string> => {
  // Function to check if a string is base64 encoded
  const isBase64Image = (str: string): boolean => {
    const base64Regex = /^data:image\/[a-z]+;base64,/;
    return base64Regex.test(str);
  };

  // Function to check if a string is likely a URL
  const isUrl = (str: string): boolean => {
    const urlRegex = /^(https?:\/\/|\/)/i;
    return urlRegex.test(str);
  };

  // If it's a URL, return it directly
  if (isUrl(imageData)) {
    return imageData;
  }

  // If it's base64, proceed with upload
  if (isBase64Image(imageData)) {
    try {
      const uploadedUrl = await uploadImageToStorageResize({
        storage: storage,
        fileName: fileName,
        fileData: imageData,
        oldImageUrl: oldImageUrl,
      });
      return uploadedUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }

  // If it's neither a URL nor base64, throw an error
  throw new Error("Invalid image data format");
};

type Data = {
  producer: Producer;
  producerId: string;
};

export const updateProducer = (
  db: admin.firestore.Firestore,
  storage: admin.storage.Storage
) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { producer, producerId } = data;

      try {
        const oldProducerSnapshot = await db
          .collection("producers")
          .doc(producerId)
          .get();
        const oldProducerData = oldProducerSnapshot.data();

        if (oldProducerData) {
          const imageUrl = await uploadImageIfNeeded(
            producer.image,
            storage,
            `producers/${producer.name}-image-${uuid()}.jpg`,
            oldProducerData.image
          );
          const backgroundImageUrl = await uploadImageIfNeeded(
            producer.backgroundImage,
            storage,
            `producers/${producer.name}-background-${uuid()}.jpg`,
            oldProducerData.image
          );
          const updatedProducer: Producer = {
            ...producer,
            image: imageUrl,
            backgroundImage: backgroundImageUrl,
          };
          await db
            .collection("producers")
            .doc(producerId)
            .update({
              ...oldProducerData,
              ...updatedProducer,
            });

          return {
            success: true,
            message: "Producer created successfully",
          };
        } else {
          functions.logger.error(`Producer with ID ${producerId} not found`);
          throw new functions.https.HttpsError(
            "not-found",
            "Producer not found"
          );
        }
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
