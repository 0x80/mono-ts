import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import MUIDataTable, { type MUIDataTableMeta } from "mui-datatables";
import { useAuthContext } from "@/context/AuthContext";
import { useProducerContext } from "@/context/ProducerContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import { getEventsTicketsFromBigQueryFunction } from "@/firebase/functions/bigquery/getEventsTicketsFromBigQuery";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import type { Event } from "@/firebase/interfaces/events";
import StatusLabel from "../Operations/StatusLabel";
import GradientButton from "@/components/Materials/GradientButton";
import { validateTicketFunction } from "@/firebase/functions/events/tickets/validate";

type TicketRow = {
  id: string;
  userMail: string;
  userId: string;
  userName: string;
  userDni: string;
  ticket: string;
  status: string;
  orderId: string;
  [key: string]: string | number;
};

export default function EventTickets({
  event,
  eventId,
}: {
  event: Event;
  eventId: string;
}) {
  const [rows, setRows] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuthContext();
  const { producerId } = useProducerContext();
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!eventId || !event?.operations) return;

    getEventsTicketsFromBigQueryFunction({ eventId: eventId as string })
      .then((result) => {
        const rows = result.data.map((doc) => {
          const metadata = JSON.parse(doc.metadata);
          const row: TicketRow = {
            id: doc.document_id,
            userName:
              metadata["nombreyapellido"] && metadata["nombreyapellido"] != ""
                ? metadata["nombreyapellido"]
                : doc.userName,
            userMail: doc.userMail,
            userDni:
              metadata["dni"] && metadata["dni"] != ""
                ? metadata["dni"]
                : doc.userDni,
            ticket: doc.name,
            userId: doc.userId,
            status: doc.status,
            orderId: doc.orderId,
          };
          event.operations?.requiredMetadata?.forEach((field) => {
            row[field.name] = metadata[field.name] || "";
          });

          return row;
        });
        setRows(rows);

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [eventId, event?.operations, isAdmin]);

  const handleValidation = async (ticketId: string, userId: string) => {
    setValidating(true);
    try {
      const result = await validateTicketFunction({
        qrHash: [eventId, ticketId, userId].join(","),
        eventRefId: eventId,
        validatedAt: new Date().toISOString(),
      });
      if (result.data.success) {
        const newRows = rows.map((ticket) => {
          if (ticket.id == ticketId) {
            return {
              ...ticket,
              status: "Validated",
            };
          }
          return ticket;
        });
        setRows(newRows);
      }
    } finally {
      setValidating(false);
    }
  };

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
    { name: "ticket", label: "Ticket", width: 200 },
    {
      name: "status",
      label: "Estado",
      width: 200,
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value: string) => <StatusLabel status={value} />,
      },
    },
    ...(event?.operations.requiredMetadata
      ? event.operations.requiredMetadata
          .filter(
            (field) => field.name !== "dni" && field.name !== "nombreyapellido"
          )
          .map((field) => ({
            name: field.name,
            label: field.label,
            width: 200,
            options: {
              filter: false,
              sort: true,
            },
          }))
      : []),
    {
      name: "orderId",
      label: "ID Orden",
      width: 200,
      options: {
        filter: true,
        sort: true,
      },
    },
    {
      name: "validate",
      label: "Validar",
      width: 200,
      options: {
        filter: true,
        sort: true,
        customBodyRender: (_: string, tableMeta: MUIDataTableMeta) => {
          const ticket: TicketRow = rows[tableMeta.rowIndex]!;

          return (
            <GradientButton
              disabled={ticket.status == "Validated"}
              onClick={() => void handleValidation(ticket.id, ticket.userId)}
              loading={validating}
            >
              Validar
            </GradientButton>
          );
        },
      },
    },
  ];

  if (loading) return <LoadingComponent />;

  if (!event) return <div>Event not found</div>;

  if (!isAdmin && producerId !== event?.producer.id) return <Unauthorized />;

  const options = {
    downloadOptions: {
      filename: "eventTickets.csv",
      separator: ",",
    },
    downloadable: isAdmin,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDownload: (buildHead: any, buildBody: any, columns: any, data: any) => {
      return buildHead(columns) + buildBody(data);
    },
    selectableRows: "none" as const,
  };

  return (
    <Box style={{ marginTop: "32px" }}>
      <MUIDataTable
        title={"Tickets"}
        data={rows}
        columns={columns}
        options={options}
      />
    </Box>
  );
}
