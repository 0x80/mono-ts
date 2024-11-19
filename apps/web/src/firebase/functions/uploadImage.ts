import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from ".";

// Define the type for the uploadImageFunction
type UploadImageFunction = HttpsCallable<
  {
    fileData: string;
    fileName: string;
  },
  void
>;

// Create the uploadImageFunction
export const uploadImageFunction: UploadImageFunction = httpsCallable(
  functions,
  "uploadImage"
);
