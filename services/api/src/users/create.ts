import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dni: string;
  dniType: string;
  country: string;
};

export const createUser = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { email, password, firstName, lastName, dni, dniType, country } =
        data;
      functions.logger.info(
        "Creating a user",
        email,
        password,
        firstName,
        lastName,
        dni,
        dniType,
        country
      );

      try {
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

        const emailValidator = usersRef.where("email", "==", email);
        if ((await emailValidator.get()).size > 0) {
          return {
            success: false,
            message: "El email ya esta registrado",
          };
        }

        await admin
          .auth()
          .createUser({
            email: email,
            password: password,
            displayName: `${firstName} ${lastName}`,
          })
          .then(async (userRecord: admin.auth.UserRecord) => {
            const user = {
              email: email,
              firstName: firstName,
              lastName: lastName,
              display_name: `${firstName} ${lastName}`,
              dni: dni,
              dniType: dniType,
              country: country,
            };
            await usersRef.doc(userRecord.uid).set({
              ...user,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            // await admin.auth().setCustomUserClaims(userRecord.uid, {
            //   dni: dni,
            // });
            return { success: false, message: userRecord };
          })
          .catch((error) => {
            functions.logger.error("Error creating user:", error);
            throw new Error(error.message);
          });

        return {
          success: true,
          message: "User created successfully",
        };
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
