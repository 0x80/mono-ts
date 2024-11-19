import { doc, getDoc } from "@firebase/firestore";
import db from "../utils";

export const getEventStats = async (eventId: string) => {
  const eventStatsRef = doc(db.stats(eventId), "stats");
  return getDoc(eventStatsRef);
};
