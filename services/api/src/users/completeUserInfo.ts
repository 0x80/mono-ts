import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  display_name: string;
  dni: string;
  dniType: string;
  country: string;
};

export const completeUserInfo = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { display_name, dni, dniType, country } = data;
      const splitedName = display_name.split(" ");

      const firstName = splitedName[0] ?? "";
      const lastName = splitedName.length > 1 ? splitedName[1] : "";
      const usersRef = db.collection("users");

      const dniValidator = usersRef
        .where("dni", "==", dni)
        .where("country", "==", country);
      if ((await dniValidator.get()).size > 0) {
        return {
          success: false,
          message: "El DNI ya esta registrado",
        };
      }

      try {
        const user = {
          firstName: firstName,
          lastName: lastName,
          dni: dni,
          dniType: dniType,
          country: country,
        };
        await db
          .collection("users")
          .doc(request.auth?.uid ?? "")
          .update({
            ...user,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        const userAuth = await admin.auth().getUser(request.auth?.uid ?? "");
        await admin.auth().setCustomUserClaims(request.auth?.uid ?? "", {
          ...userAuth.customClaims,
          dni: dni,
        });
        return { success: true, message: "success" };
      } catch (error) {
        if (error instanceof Error) {
          return { success: false, message: error.message };
        } else {
          return { success: false, message: "An error occurred" };
        }
      }
    }
  );
};
