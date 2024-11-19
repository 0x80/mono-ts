import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// import { createNeoUser } from "..";

export const onCreateUser = (db: admin.firestore.Firestore) => {
  return functions.firestore.onDocumentCreated(
    "users/{userId}",
    async (event) => {
      functions.logger.info("Checking resell status");
      const snapshot = event.data;
      if (!snapshot) {
        functions.logger.error("Document does not exist");
        return;
      }
      try {
        await handleUserCreation(snapshot, db);
      } catch (error) {
        console.error("Error handling user creation:", error);
      }

      // try {
      //   await createNeoUser(
      //     user.data().display_name,
      //     user.id,
      //     user.data().photo_url ?? "",
      //     user.data().email
      //   );
      // } catch (error) {
      //   console.error("Error creating Neo user:", error);
      // }
    }
  );
};

const handleUserCreation = async (
  user: functions.firestore.QueryDocumentSnapshot,
  db: admin.firestore.Firestore
) => {
  const userAuth = await admin.auth().getUser(user.id);
  const newSubscriptions = await getNewSubscriptions(user, db);

  const userRecord = db.collection("users").doc(user.id);
  await userRecord.update({
    subscriptions: newSubscriptions,
    uid: user.id,
    bank: getDefaultBankDetails(),
    role: "User",
    followersCount: 0,
    followingCount: 0,
    isPublic: true,
    producers: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    display_name: userAuth.displayName ?? userAuth.email,
    email: userAuth.email,
    photo_url: userAuth.photoURL ?? "",
  });

  await setCustomUserClaims(user, userAuth);
};

const getNewSubscriptions = async (
  user: functions.firestore.QueryDocumentSnapshot,
  db: admin.firestore.Firestore
) => {
  const producers = await db
    .collection("producers")
    .where("domains", "array-contains", user.data().email?.split("@")[1])
    .get();

  return producers.docs.map((producer) => ({
    id: producer.id,
    name: producer.data().name,
  }));
};

const getDefaultBankDetails = () => ({
  bankAccountType: "",
  bankAccountNumber: "",
  bankAccountName: "",
  bankAccountDni: "",
  bankAccountEmail: "",
  bankName: "",
});

const setCustomUserClaims = async (
  user: functions.firestore.QueryDocumentSnapshot,
  userAuth: admin.auth.UserRecord
) => {
  const claims =
    user.data().dni && user.data().dni !== ""
      ? { role: "User", dni: user.data().dni }
      : { ...userAuth.customClaims, role: "User" };

  await admin.auth().setCustomUserClaims(user.id, claims);
};
