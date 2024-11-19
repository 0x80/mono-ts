import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

export type Data = {
  contacts: {
    name: string;
    phone_number: string;
  }[];
};

export const getUserContacts = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const { contacts } = data;
      const contactsPhone: { [key: string]: string } = {};
      const usersInAppQuery: Promise<
        admin.firestore.QuerySnapshot<
          admin.firestore.DocumentData,
          admin.firestore.DocumentData
        >
      >[] = [];
      let count = 0;
      let userPhonesFilter: string[] = [];
      contacts.forEach((contact) => {
        contactsPhone[contact.phone_number] = contact.name;
        userPhonesFilter.push(contact.phone_number);
        count++;
        if (count == 30) {
          count = 0;
          usersInAppQuery.push(
            db
              .collection("users")
              .where("phone_number", "in", userPhonesFilter)
              .get()
          );
          userPhonesFilter = [];
        }
      });

      const result = await Promise.all(usersInAppQuery);
      const usersInApp = result.map((query) => {
        return query.docs.map((doc) => {
          return {
            phone_number: doc.data().phone_number,
            name: contactsPhone[doc.data().phone_number],
          };
        });
      });
      functions.logger.info(usersInApp);
      return usersInApp;
    }
  );
};
