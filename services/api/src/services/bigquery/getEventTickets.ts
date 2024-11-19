import * as functions from "firebase-functions";
import { runBigQuery } from "./utils";
import { getCurrentEnv } from "../../utils/getCurrentEnv";
import type { CallableRequest } from "firebase-functions/https";

type Data = {
  eventId: string;
};

export const getEventsTicketsFromBigQuery = () => {
  const { projectId } = getCurrentEnv();
  return functions.https.onCall(
    {
      region: "southamerica-east1",
    },
    async (request: CallableRequest<Data>) => {
      const { data } = request;
      const query = `
    SELECT document_id, userName, userMail,userDni, name, metadata,status,channel, orderId
    FROM \`${projectId}.firestore_export.tickets_schema_tickets_latest\`
    WHERE eventId = @eventId AND status != 'Reselled'
  `;
      return runBigQuery(query, { eventId: data.eventId }).then((result) => {
        return result.data;
      });
    }
  );
};
