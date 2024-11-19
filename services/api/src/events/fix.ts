import * as functions from "firebase-functions";
import type admin from "firebase-admin";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
};

export const fixTickets = (db: admin.firestore.Firestore) => {
  return functions.https.onCall(
    {
      memory: "2GiB",
      region: "southamerica-east1",

      timeoutSeconds: 540,
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      return data.eventId, db;
    }
  );
};

// export const fixTickets = (db: admin.firestore.Firestore) => {
//   return functions
//     .region("southamerica-east1")
//     .runWith({
//       memory: "2GB",
//       timeoutSeconds: 540,
//     })
//     .https.onCall(async (data: { eventId: string }) => {
//       const { eventId } = data;

//       const orders = await db
//         .collection("orders")
//         .where("eventId", "==", eventId)
//         .where("status", "==", "Approved")
//         .get();

//       let currentBatch = db.batch();
//       let currentBatchSize = 0;
//       const batches = [currentBatch];

//       // Helper function to check if a document exists before adding it to the batch
//       async function addUpdateToBatch(
//         batch: admin.firestore.WriteBatch,
//         docRef: admin.firestore.DocumentReference<
//           admin.firestore.DocumentData,
//           admin.firestore.DocumentData
//         >,
//         data: {
//           [key: string]: {
//             [key: string]: string;
//           };
//         },
//         orderId: string
//       ) {
//         try {
//           const doc = await docRef.get();
//           if (doc.exists && !doc.data()?.metadata.dni) {
//             batch.update(docRef, data);
//             return true;
//           } else {
//             console.warn(orderId);
//             console.warn(`Document not found: ${docRef.path}`);
//             return false;
//           }
//         } catch (error) {
//           console.warn(orderId);
//           console.error(`Error checking document: ${docRef.path}`, error);
//           return false;
//         }
//       }

//       // Iterate over each order document
//       for (const doc of orders.docs) {
//         if (++currentBatchSize >= 500) {
//           currentBatch = db.batch();
//           batches.push(currentBatch);
//           currentBatchSize = 1;
//         }

//         const orderData = doc.data() as Order;

//         // Add each ticket update to the batch if the document exists
//         for (const schedule of orderData.items) {
//           for (let k = 0; k < schedule.quantity; k++) {
//             const ticketNameRef = `${schedule.name}-${k}`;
//             const docRef = db
//               .collection("events")
//               .doc(eventId)
//               .collection("tickets")
//               .doc(schedule.ids[k]);

//             const metadata = orderData.metadata
//               ? orderData.metadata[ticketNameRef]
//               : orderData.metadata ?? {};

//             // Check document existence and add update to batch if valid
//             await addUpdateToBatch(
//               currentBatch,
//               docRef,
//               {
//                 metadata: {
//                   ...metadata,
//                   dni: !metadata.dni
//                     ? orderData.userDni
//                         .trim()
//                         .replace(".", "")
//                         .replace("-", "")
//                         .toLowerCase()
//                     : metadata.dni
//                         .trim()
//                         .replace(".", "")
//                         .replace("-", "")
//                         .toLowerCase(),
//                 },
//               },
//               doc.id
//             );
//           }
//         }
//       }

//       // Commit all batches
//       await Promise.all(batches.map((batch) => batch.commit()));
//     });
// };

// export const fixTickets = (db: admin.firestore.Firestore) => {
//   return functions
//     .region("southamerica-east1")
//     .runWith({
//       memory: "2GB",
//       timeoutSeconds: 540,
//     })
//     .https.onCall(async (data: { eventId: string; eventId2: string }) => {
//       const { eventId } = data;

//       const tickets = await db
//         .collection("events")
//         .doc(eventId)
//         .collection("tickets")
//         .where("status", "in", ["Pending", "Reselling"])
//         .limit(55)
//         .get();

//       const batch = db.batch();

//       tickets.forEach((ticket) => {
//         batch.update(ticket.ref, {
//           name: "Preventa 2",
//         });
//       });

//       await batch.commit();
//     });
// };

// export const fixTickets = (db: admin.firestore.Firestore) => {
//   return functions
//     .region("southamerica-east1")
//     .runWith({
//       memory: "2GB",
//       timeoutSeconds: 540,
//     })
//     .https.onCall(async (data: { eventId: string }) => {
//       const { eventId } = data;

//       const orders = await db
//         .collection("orders")
//         .where("eventId", "==", eventId)
//         .where("status", "==", "Approved")
//         .get();

//       const batch = db.batch();

//       orders.forEach((order) => {
//         const orderData = order.data();
//         orderData.items.forEach((item: OrderItem) => {
//           const newTicket = {
//             eventId: orderData.eventId,
//             eventName: orderData.eventName,
//             locationName: orderData.eventLocationName,
//             address: orderData.eventLocationAddress,
//             eventActivationDate: orderData.eventActivationDate,
//             userId: orderData.userId,
//             status: "Pending",
//             eventStart: orderData.eventStartDate,
//             eventEnd: orderData.eventEndDate,
//             eventImageUrl: orderData.eventImageUrl,
//             userMail: orderData.userMail,
//             userName: orderData.userName,
//             userDni: orderData.userDni,
//             name: item.name,
//             price: item.price,
//             date: "date",
//             hour: 0,
//             isConcurrent: orderData.isConcurrent ?? false,
//             orderId: orderData.orderId,
//             producerId: orderData.producerId,
//             type: item.type,
//             description: item.description,
//             metadata: orderData.metadata
//               ? orderData.metadata[item.name + "-0"] ?? orderData.metadata
//               : {},
//             channel: orderData.channel,
//             resellable: orderData.resellable ?? true,
//           } as Ticket;
//           batch.update(
//             db
//               .collection("events")
//               .doc(eventId)
//               .collection("tickets")
//               .doc(item.ids[0]),
//             {
//               ...newTicket,
//               createdAt: admin.firestore.FieldValue.serverTimestamp(),
//               updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//             }
//           );
//         });
//       });

//       await batch.commit();
//     });
// };

// export const fixTickets = (db: admin.firestore.Firestore) => {
//   return functions
//     .region("southamerica-east1")
//     .runWith({
//       memory: "2GB",
//       timeoutSeconds: 540,
//     })
//     .https.onCall(async (data: { eventId: string }) => {
//       const { eventId } = data;

//       const tickets = await db
//         .collection("events")
//         .doc(eventId)
//         .collection("tickets")
//         .get();

//       let currentBatch = db.batch();
//       let currentBatchSize = 0;
//       const batches = [currentBatch];

//       // Helper function to check if a document exists before adding it to the batch

//       // Iterate over each order document
//       for (const doc of tickets.docs) {
//         if (++currentBatchSize >= 500) {
//           currentBatch = db.batch();
//           batches.push(currentBatch);
//           currentBatchSize = 1;
//         }

//         const ticketData = doc.data() as Ticket;

//         currentBatch.update(doc.ref, {
//           metadata: {
//             ...ticketData.metadata,
//             dni: ticketData.metadata.dni
//               ? ticketData.metadata.dni
//                   .trim()
//                   .replace(".", "")
//                   .replace("-", "")
//                   .toLowerCase()
//               : "",
//           },
//         });

//         // Add each ticket update to the batch if the document exists
//       }

//       // Commit all batches
//       await Promise.all(batches.map((batch) => batch.commit()));
//     });
// };

// export const fixTickets = (db: admin.firestore.Firestore) => {
//   return functions
//     .region("southamerica-east1")
//     .runWith({
//       memory: "2GB",
//       timeoutSeconds: 540,
//     })
//     .https.onCall(async (data: { eventId: string; eventId2: string }) => {
//       const { eventId, eventId2 } = data;

//       const tickets = await db
//         .collection("events")
//         .doc(eventId)
//         .collection("tickets")
//         .where("status", "in", ["Pending", "Reselling"])
//         .get();

//       const eventData = (
//         await db.collection("events").doc(eventId).get()
//       ).data() as Event;

//       const newSchedules: { [key: string]: any } = {};
//       eventData.schedule.forEach((schedule) => {
//         newSchedules[schedule.name] = {
//           ticketTotal: 0,
//           ticketCount: 0,
//           serviceFeeSelled: 0,
//           totalSelled: 0,
//           totalWithServiceFeeSelled: 0,
//           ticketSelledCount: 0,
//         };
//       });

//       tickets.forEach((ticket) => {
//         const ticketData = ticket.data() as Ticket;
//         const schedule = eventData.schedule.find(
//           (schedule) => schedule.name === ticketData.name
//         );

//         if (schedule) {
//           newSchedules[schedule.name].ticketTotal += 1;
//           newSchedules[schedule.name].ticketCount += 1;
//           newSchedules[schedule.name].ticketSelledCount += 1;
//           newSchedules[schedule.name].totalSelled += schedule.price;

//           newSchedules[schedule.name].serviceFeeSelled +=
//             schedule.price * eventData.finance.serviceFee;
//           newSchedules[schedule.name].totalWithServiceFeeSelled +=
//             schedule.price + schedule.price * eventData.finance.serviceFee;
//         }
//         return;
//       });

//       const newSchedulesData = eventData.schedule.map((schedule) => {
//         const newSchedule = newSchedules[schedule.name];
//         return {
//           ...schedule,
//           ticketTotal: newSchedule.ticketTotal,
//           ticketCount: newSchedule.ticketCount,
//           serviceFeeSelled: newSchedule.serviceFeeSelled,
//           totalSelled: newSchedule.totalSelled,
//           totalWithServiceFeeSelled: newSchedule.totalWithServiceFeeSelled,
//           ticketSelledCount: newSchedule.ticketSelledCount,
//         };
//       });

//       await db
//         .collection("events")
//         .doc(eventId2)
//         .update({
//           schedule: newSchedulesData,
//           stats: calculateStats(
//             newSchedulesData,
//             eventData,
//             eventData.stats.resellDeltaEarnings
//           ),
//         });
//     });
// };

// export const fixTickets = (db: admin.firestore.Firestore, storage: Storage) => {
//   return functions
//     .region("southamerica-east1")
//     .runWith({ timeoutSeconds: 540, memory: "2GB" })
//     .https.onCall(async (input) => {
//       const bucket = storage.bucket("gs://early-prod-dddac.appspot.com"); // Replace with your bucket name
//       const file = bucket.file("Renominas 711-1.csv"); // Specify the path to the CSV file

//       const data: any[] = [];
//       // id productora = 2uIeMIZ0UEpfygt8JWkt

//       // Create a readable stream from the file
//       const stream = file.createReadStream();
//       const dataRows: {
//         oldDni: any;
//         newDni: any;
//         ticketId: any;
//       }[] = [];
//       await new Promise((resolve, reject) => {
//         // Pipe the stream through the CSV parser
//         stream
//           .pipe(
//             csvParser({
//               headers: true,
//               mapHeaders: ({ header }) => header.trim(),
//             })
//           )
//           .on("data", (row: any) => {
//             data.push(row); // Collect parsed rows
//           })
//           .on("end", async () => {
//             try {
//               data.forEach(async (row, _) => {
//                 const rowMap = {
//                   oldDni: row["_2"],
//                   newDni: row["_1"],
//                   ticketId: row["_0"],
//                 };
//                 dataRows.push(rowMap);
//               });

//               resolve({ success: true, message: "Data processed and saved" });
//             } catch (error) {
//               console.error("Error saving data to Firestore:", error);
//               reject(
//                 new functions.https.HttpsError(
//                   "internal",
//                   "Failed to save data to Firestore"
//                 )
//               );
//             }
//           })
//           .on("error", (error: any) => {
//             console.error("Error reading CSV file:", error);
//             reject(
//               new functions.https.HttpsError(
//                 "internal",
//                 "Failed to read CSV file"
//               )
//             );
//           });
//       });

//       const tickets = [];

//       for (const row of dataRows) {
//         const ticket = await db
//           .collection("events")
//           .doc(input.eventId)
//           .collection("tickets")
//           .doc(row.ticketId)
//           .get();
//         tickets.push(ticket);
//       }

//       let currentBatch = db.batch();
//       let currentBatchSize = 0;
//       const batches = [currentBatch];

//       for (const ticket of tickets) {
//         if (++currentBatchSize >= 500) {
//           currentBatch = db.batch();
//           batches.push(currentBatch);
//           currentBatchSize = 1;
//         }
//         const data = dataRows.find((row) => row.ticketId === ticket.id);
//         // Add operation to batch
//         currentBatch.update(
//           db
//             .collection("events")
//             .doc(input.eventId)
//             .collection("tickets")
//             .doc(data?.ticketId),
//           { metadata: { ...ticket?.data()?.metadata, dni: data?.newDni } }
//         );
//       }

//       await Promise.all(batches.map((batch) => batch.commit()));

//       return { success: true, message: "CSV file processed and saved" };
//     });
// };

// export const fixTickets = (db: admin.firestore.Firestore, storage: Storage) => {
//   return functions
//     .region("southamerica-east1")
//     .runWith({ timeoutSeconds: 540, memory: "2GB" })
//     .https.onCall(async (input) => {
//       const bucket = storage.bucket("gs://early-prod-dddac.appspot.com");
//       const file = bucket.file("Renominas 711-1.csv");

//       const dataRows: Array<{ dni: string; nombreyapellido: string }> = [];

//       // Stream and parse CSV data
//       await new Promise((resolve, reject) => {
//         file
//           .createReadStream()
//           .pipe(
//             csvParser({
//               headers: true,
//               mapHeaders: ({ header }) => header.trim(),
//             })
//           )
//           .on("data", (row) => {
//             dataRows.push({
//               dni: row["_0"].toLowerCase(),
//               nombreyapellido: row["_1"],
//             });
//           })
//           .on("end", resolve)
//           .on("error", (error) => {
//             console.error("Error reading CSV file:", error);
//             reject(
//               new functions.https.HttpsError(
//                 "internal",
//                 "Failed to read CSV file"
//               )
//             );
//           });
//       });

//       // Fetch tickets based on dni from CSV data
//       const ticketsPromises = dataRows.map(async (row) => {
//         try {
//           const ticketSnapshot = await db
//             .collection("events")
//             .doc(input.eventId)
//             .collection("tickets")
//             .where("metadata.dni", "==", row.dni)
//             .limit(1)
//             .get();
//           return ticketSnapshot.docs[0];
//         } catch (error) {
//           console.error("Error fetching ticket for dni:", row.dni, error);
//           return null;
//         }
//       });

//       const tickets = (await Promise.all(ticketsPromises)).filter(Boolean);

//       // Batch update tickets with new metadata
//       let batch = db.batch();
//       let batchSize = 0;
//       const BATCH_LIMIT = 500;

//       for (const ticket of tickets) {
//         const dataRow = dataRows.find(
//           (row) => row.dni === ticket?.data()?.metadata.dni
//         );
//         if (dataRow) {
//           batch.update(ticket!.ref, {
//             "metadata.nombreyapellido": dataRow.nombreyapellido,
//           });
//           batchSize++;
//         }

//         // Commit batch if limit is reached
//         if (batchSize >= BATCH_LIMIT) {
//           await batch.commit();
//           batch = db.batch();
//           batchSize = 0;
//         }
//       }

//       // Commit remaining batch operations
//       if (batchSize > 0) {
//         await batch.commit();
//       }

//       return { success: true, message: "CSV file processed and saved" };
//     });
// };
