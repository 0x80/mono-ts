import { httpsCallable, type HttpsCallable } from "firebase/functions";
import functions from "..";

type ChangeUserRoleFunction = HttpsCallable<
  {
    uid: string;
    role: string;
  },
  void
>;

export const changeUserRoleFunction: ChangeUserRoleFunction = httpsCallable(
  functions,
  "changeUserRole"
);
