import * as functions from "firebase-functions";
import { runBigQuery } from "./utils";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import type { CallableRequest } from "firebase-functions/https";

type OrderRow = {
  document_id: string;
  userName: string;
  userMail: string;
  userDni: string;
  totalSelled: number;
  createdAt: string;
  channel: string;
};

type Data = {
  eventId: string;
};

export const getEventsOrdersFromBigQuery = () => {
  const { projectId } = getCurrentEnv();
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const query = `
        SELECT document_id, userName, userMail, userDni, CAST(totalSelled AS FLOAT64) AS totalSelled,
        createdAt, channel
        FROM \`${projectId}.firestore_export.orders_schema_orders_latest\`
        WHERE eventId = @eventId AND status = 'Approved'
      `;

      try {
        // Run the query
        const result = await runBigQuery(query, { eventId: data.eventId });

        // Check if result.data is an array or large object
        // Limit the number of results if needed

        const cleanData = result.data.map((row: OrderRow) => {
          return {
            document_id: row.document_id ?? "",
            userName: row.userName ?? "",
            userMail: row.userMail ?? "",
            userDni: row.userDni ?? "",
            totalSelled: row.totalSelled ?? 0,
            createdAt: row.createdAt, // Convert timestamp to ISO string
            channel: row.channel ?? "",
          };
        });
        return cleanData;
      } catch (error) {
        // Handle errors properly
        console.log(error);
        return { success: false, message: error };
      }
    }
  );
};
