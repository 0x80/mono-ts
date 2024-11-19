import type { TicketSchedule } from ".";
import type admin from "firebase-admin";
import * as crypto from "crypto"; // Import crypto for hashing

export const checkIfHasPrivateDomain = (
  domains: string[] | null,
  email: string
): boolean => {
  if (domains === null || domains.length === 0) {
    return false;
  }
  return !domains.includes(email.split("@")[1] ?? "-");
};

export const checkIfHasUniqueTickets = async (
  db: admin.firestore.Firestore,
  eventId: string,
  schedules: TicketSchedule[],
  userId: string,
  userDni: string,
  earlyHash: string,
  producerId: string
): Promise<void> => {
  const hasUnique = schedules.some((schedule) => {
    return schedule.type === "unique" && schedule.count > 0;
  });
  const hasPrivate = schedules.some((schedule) => {
    return schedule.type === "private" && schedule.count > 0;
  });

  if (hasUnique) {
    await db
      .collection("events")
      .doc(eventId)
      .collection("tickets")
      .where("userId", "==", userId)
      .where("type", "in", ["unique", "private"])
      .where("status", "!=", "Reselled")
      .limit(1)
      .get()
      .then((snapshot) => {
        if (!snapshot.empty) {
          throw new Error("Ya tienes una entrada única para este evento");
        }
      });
  }

  if (hasPrivate && earlyHash != "") {
    const hashedValue = crypto
      .createHmac("sha256", earlyHash)
      .update(userDni)
      .digest("hex");

    await db
      .collection("producers")
      .doc(producerId)
      .collection("privateList")
      .where("id", "==", hashedValue)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          throw new Error(
            "Ups! No tienes permiso para comprar esta entrada, revisa la descripción del ticket!"
          );
        }
      });
  }

  return;
};
