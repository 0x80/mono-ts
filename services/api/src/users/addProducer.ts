import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  producerId: string;
  producerName: string;
  add: boolean;
  userRef: string;
};

export const addProducerFunction = async (
  db: admin.firestore.Firestore,
  add: boolean,
  producerId: string,
  producerName: string,
  userRef: string
) => {
  if (add) {
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userRef)
      .get();
    const user = userSnapshot.docs[0];

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (
      user &&
      (!user.data()?.producers || user.data()?.producers.length === 0) &&
      user.data()?.role === "User"
    ) {
      const userAuth = await admin.auth().getUserByEmail(userRef);
      await admin.auth().setCustomUserClaims(userAuth.uid, {
        ...userAuth.customClaims,
        role: "producer",
      });
    }

    await db
      .collection("users")
      .doc(user.id)
      .update({
        producers: admin.firestore.FieldValue.arrayUnion({
          id: producerId,
          name: producerName,
        }),
        role: "producer",
      });
    await db
      .collection("producers")
      .doc(producerId)
      .update({
        users: admin.firestore.FieldValue.arrayUnion({
          id: user.id,
          email: user.data()?.email,
        }),
      });

    return {
      success: true,
      message: "Producer added to user successfully",
    };
  } else {
    const user = await db.collection("users").doc(userRef).get();
    if (
      user.data()?.producers.length === 1 &&
      user.data()?.role === "producer"
    ) {
      const userAuth = await admin.auth().getUser(userRef);
      await admin.auth().setCustomUserClaims(userRef, {
        ...userAuth.customClaims,
        role: "User",
      });
    }
    await db
      .collection("users")
      .doc(userRef)
      .update({
        producers: admin.firestore.FieldValue.arrayRemove({
          id: producerId,
          name: producerName,
        }),
        role: "User",
      });
    await db
      .collection("producers")
      .doc(producerId)
      .update({
        users: admin.firestore.FieldValue.arrayRemove({
          id: userRef,
          email: user.data()?.email,
        }),
      });
    return {
      success: true,
      message: "Producer removed from user successfully",
    };
  }
};

export const addProducerToUser = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { producerId, producerName, add, userRef } = data;

      try {
        return addProducerFunction(db, add, producerId, producerName, userRef);
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
