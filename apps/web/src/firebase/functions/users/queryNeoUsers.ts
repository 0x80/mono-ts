import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type QueryNeoUsersFunction = HttpsCallable<
  {
    query: string;
  },
  {
    elementId: string;
    displayName: string;
    photoURL: string;
  }[]
>;

export const queryNeoUsersFunction: QueryNeoUsersFunction = httpsCallable(
  functions,
  "queryNeoUsers"
);
