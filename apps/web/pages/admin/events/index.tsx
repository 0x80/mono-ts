import React, { useEffect, useState, type FC } from "react";
import { Box } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { formatDate } from "@/utils/formatDate";
import { streamEvents } from "@/firebase/db/events";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import { useAuthContext } from "@/context/AuthContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import { useRouter } from "next/router";
import StatusLabel from "@/components/Event/Operations/StatusLabel";
import Image from "next/image";
import ProgressBar from "@/components/Materials/ProgressBar";
import { formatPriceToCLP } from "@/utils/parsePrice";
import GradientButton from "@/components/Materials/GradientButton";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import type { Event } from "@/firebase/interfaces/events";
import ExternalClicked from "@/components/Event/Operations/ExternalClicked";
import DropdownMenu from "@/components/Materials/DropdownMenu";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((_) => ({
  tableContainer: {
    width: "100%",
    background: "#fff",
    borderRadius: "8px",
    marginBottom: "64px",
  },

  eventTitle: {
    fontWeight: "bold",
  },
  eventTitleColumn: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "150px",
  },
  eventSubTitle: {
    color: "#666",
  },
  seeButton: {
    width: "50px",
    height: "50px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientButton: {
    marginBottom: "16px",
  },
}));

type EventRow = {
  id: string;
  eventName: string;
  eventStatus: string;
  eventStart: string;
  eventLocation: string;
  eventImage: string;
  ticketSelled: number;
  ticketTotal: number;
  totalWithServiceFeeSelled: number;
  totalReselled: number;
  resellDeltaEarnings: number;
};

const activatedStatus = ["Active", "Visible", "Expired", "Private"];

const AdminEvents: FC = () => {
  const { classes } = useStyles();
  const { isAdmin } = useAuthContext();
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = streamEvents(
      (snapshot) => {
        const rows = snapshot.docs.map((doc) => {
          const event = doc.data() as Event;
          return {
            id: doc.id,
            eventName: event.info.name,
            eventStatus: event.info.status,
            eventStart: formatDate(event.info.start?.toDate() || new Date()),
            eventLocation: event.location.name,
            eventImage: event.info.image,
            ticketSelled: event.stats.ticketSelledCount,
            ticketTotal: event.stats.ticketTotal,
            totalWithServiceFeeSelled: event.stats.totalWithServiceFeeSelled,
            totalReselled: event.stats.totalReselled,
            resellDeltaEarnings: event.stats.resellDeltaEarnings,
          };
        });
        setRows(rows);
        setLoading(false);
      },
      () => {
        return;
      }
    );
    return () => unsubscribe();
  }, []);

  const columns = [
    {
      name: "id",
      label: "ID",
      width: 90,
      options: { filter: false, sort: false },
    },
    {
      name: "eventImage",
      label: "Imagen",
      width: 90,
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_: string, tableMeta: { rowIndex: number }) => {
          const event = rows[tableMeta.rowIndex] ?? {
            eventImage: "",
            eventName: "",
          };
          return (
            <Image
              src={event.eventImage}
              alt={event.eventName}
              style={{ width: "100px", height: "100px", borderRadius: "8px" }}
              height={100}
              width={100}
            />
          );
        },
      },
    },
    {
      name: "eventName",
      label: "Nombre",
      width: 100,
      options: {
        filter: false,
        sort: true,
        customBodyRender: (_: string, tableMeta: { rowIndex: number }) => {
          const event = rows[tableMeta.rowIndex] ?? {
            eventStart: "",
            eventName: "",
            eventLocation: "",
          };
          return (
            <div className={classes.eventTitleColumn}>
              <div className={classes.eventTitle}>{event.eventName}</div>
              <div className={classes.eventSubTitle}>
                {event.eventLocation} | {event.eventStart}
              </div>
            </div>
          );
        },
      },
    },
    {
      name: "eventStatus",
      label: "Estado",
      width: 100,
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value: string) => <StatusLabel status={value} />,
      },
    },
    {
      name: "ticketSelled",
      label: "Vendidos",
      width: 100,
      options: {
        filter: false,
        sort: true,
        customBodyRender: (_: string, tableMeta: { rowIndex: number }) => {
          const event = rows[tableMeta.rowIndex] ?? {
            eventStatus: "",
            ticketSelled: 0,
            ticketTotal: 0,
            id: "",
          };
          return activatedStatus.includes(event.eventStatus) ? (
            <ProgressBar
              ticketSelled={event.ticketSelled}
              ticketTotal={event.ticketTotal}
            />
          ) : event.eventStatus == "External" ? (
            <ExternalClicked eventId={event.id} dashboard={false} />
          ) : (
            <></>
          );
        },
      },
    },
    {
      name: "revenue",
      label: "Ingresos",
      width: 100,
      options: {
        filter: false,
        sort: true,
        customBodyRender: (_: string, tableMeta: { rowIndex: number }) => {
          const event = rows[tableMeta.rowIndex] ?? {
            eventStatus: "",
            totalWithServiceFeeSelled: 0,
            totalReselled: 0,
            resellDeltaEarnings: 0,

            id: "",
          };
          return activatedStatus.includes(event.eventStatus) ? (
            <div className={classes.eventTitle}>
              {formatPriceToCLP(
                event.totalWithServiceFeeSelled ||
                  0 + event.totalReselled ||
                  0 + (event.resellDeltaEarnings || 0)
              )}
            </div>
          ) : (
            <></>
          );
        },
      },
    },

    {
      name: "actions",
      label: "Acciones",
      width: 120,
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_: string, tableMeta: { rowIndex: number }) => {
          const event = rows[tableMeta.rowIndex] ?? {
            eventStatus: "",
            totalWithServiceFeeSelled: 0,
            totalReselled: 0,
            resellDeltaEarnings: 0,

            id: "",
          };
          return (
            <DropdownMenu eventId={event.id} eventStatus={event.eventStatus} />
          );
        },
      },
    },
    {
      name: "",
      label: "",
      width: 120,
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_: string, tableMeta: { rowIndex: number }) => {
          const event = rows[tableMeta.rowIndex] ?? { id: "" };
          return (
            <div
              className={classes.seeButton}
              onClick={() => {
                void router.push(`/producers/events/${event.id}`);
              }}
            >
              <ChevronRightRoundedIcon />
            </div>
          );
        },
      },
    },
  ];

  if (!isAdmin) return <Unauthorized />;

  return (
    <Box className={classes.tableContainer}>
      <div className={classes.gradientButton}>
        <GradientButton
          variant="contained"
          color="secondary"
          onClick={() => {
            router.push("/events/create");
          }}
        >
          Crear nuevo evento
        </GradientButton>
      </div>
      {loading ? (
        <LoadingComponent />
      ) : (
        <MUIDataTable
          title={"Eventos"}
          data={rows}
          columns={columns}
          options={{
            filterType: "dropdown",
            responsive: "vertical",
            selectableRows: "none",
            print: false,
            download: false,
            viewColumns: false,
            setRowProps: () => ({
              style: { cursor: "pointer" },
            }),
          }}
        />
      )}
    </Box>
  );
};

export default AdminEvents;
