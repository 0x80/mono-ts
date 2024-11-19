import * as functions from "firebase-functions";
import sharp from "sharp";
import type * as admin from "firebase-admin";

export const uploadImageToStorageResize = async ({
  storage,
  fileName,
  fileData,
  oldImageUrl,
}: {
  storage: admin.storage.Storage;
  fileName: string;
  fileData: string;
  oldImageUrl?: string;
}): Promise<string> => {
  const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
  const imageBuffer = Buffer.from(base64Data, "base64");
  if (oldImageUrl && oldImageUrl != "") {
    try {
      const storageUrlPrefix = "https://storage.googleapis.com/";
      if (!oldImageUrl.startsWith(storageUrlPrefix)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "The provided URL is not a valid Firebase Storage URL."
        );
      }

      const urlParts = oldImageUrl.replace(storageUrlPrefix, "").split("/");
      const bucketName = urlParts.shift();
      const filePath = urlParts.join("/").replace("%2F", "/");

      if (!bucketName || !filePath) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid URL format."
        );
      }

      // Delete the file from Firebase Storage
      const bucket = storage.bucket(bucketName);
      await bucket.file(filePath).delete();
    } catch (error) {
      console.error(error);
      // Continue with upload even if delete fails
    }
  }
  // Resize the image to 400x400
  const resizedImageBuffer = await sharp(imageBuffer)
    .resize(500, 500, {
      fit: "fill", // or 'contain'
    })
    .toBuffer();

  const file = storage.bucket().file(fileName);
  await file.save(resizedImageBuffer, {
    metadata: { contentType: "image/jpeg" },
  });

  await file.makePublic();
  await file.setMetadata({
    cacheControl: "public, max-age=31536000",
  });

  return file.publicUrl();
};

export const uploadImage = (storage: admin.storage.Storage) => {
  return functions.https.onCall(
    { region: "southamerica-east1" },
    async (request) => {
      const { data } = request;
      const { fileData, fileName } = data;
      try {
        const imageBuffer = Buffer.from(fileData, "base64");

        const file = storage.bucket().file(fileName);
        await file.save(imageBuffer, {
          metadata: { contentType: "image/jpeg" },
        });
      } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError(
          "internal",
          "Error uploading image"
        );
      }
    }
  );
};
