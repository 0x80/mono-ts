import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import MUIDataTable from "mui-datatables";
import { useAuthContext } from "@/context/AuthContext";
import { useProducerContext } from "@/context/ProducerContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import type { Event } from "@/firebase/interfaces/events";
import { getEventsOrdersFromBigQueryFunction } from "@/firebase/functions/bigquery/getEventsOrdersFromBigQueryFunction";

type OrderRow = {
  id: string;
  userName: string;
  userMail: string;
  userDni: string;
  totalSelled: number;
  channel: string;
  createdAt: string;
  metadata: string;
};

export default function EventOrders({
  event,
  eventId,
}: {
  event: Event;
  eventId: string;
}) {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuthContext();
  const { producerId } = useProducerContext();

  useEffect(() => {
    if (!eventId || !event?.operations) return;

    getEventsOrdersFromBigQueryFunction({ eventId: eventId as string }).then(
      (result) => {
        const rows = result.data.map((doc) => {
          const row: OrderRow = {
            id: doc.document_id,
            userName: doc.userName,
            userMail: doc.userMail,
            userDni: doc.userDni,
            totalSelled: doc.totalSelled,
            channel: doc.channel,
            createdAt: new Date(doc.createdAt.value).toLocaleString(),
            metadata: doc.metadata,
          };

          return row;
        });
        setRows(rows);
        setLoading(false);
      }
    );
  }, [eventId, event?.operations, isAdmin]);

  const columns = [
    {
      name: "id",
      label: "ID",
      width: 90,
      options: {
        filter: false,
        sort: false,
      },
    },
    {
      name: "userName",
      label: "Nombre",
      width: 200,
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "userMail",
      label: "Email",
      width: 200,
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "userDni",
      label: "Dni",
      width: 200,
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "totalSelled",
      label: "Total",
      width: 200,
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "channel",
      label: "Canal",
      width: 200,
      options: {
        filter: false,
        sort: true,
      },
    },
    {
      name: "createdAt",
      label: "Fecha",
      width: 200,
      options: {
        filter: false,
        sort: true,
      },
    },
  ];

  if (loading) return <LoadingComponent />;

  if (!event) return <div>Event not found</div>;

  if (!isAdmin && producerId !== event?.producer.id) return <Unauthorized />;

  const options = {
    downloadOptions: {
      filename: "eventOrders.csv",
      separator: ",",
    },
    downloadable: isAdmin,
    onDownload: (buildHead: any, buildBody: any, columns: any, data: any) => {
      return buildHead(columns) + buildBody(data);
    },
    selectableRows: "none" as const,
  };

  return (
    <Box style={{ width: "100%", marginTop: "32px" }}>
      <MUIDataTable
        title={"Órdenes de compra"}
        data={rows}
        columns={columns}
        options={options}
      />
    </Box>
  );
}
