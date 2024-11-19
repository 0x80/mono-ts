import React, { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import MUIDataTable, { type MUIDataTableMeta } from "mui-datatables";
import { formatDate } from "@/utils/formatDate";
import { streamUserProducersEvents } from "@/firebase/db/users";
import type { EventWithId } from "@/firebase/interfaces/events";
// import LoadingButton from "@/components/Materials/LoadingButton";
import StatusLabel from "@/components/Event/Operations/StatusLabel";
import { useProducerContext } from "@/context/ProducerContext";
// import { setEventStatusFunction } from "@/firebase/functions/events/setEventStatus";
import { useRouter } from "next/router";
import ProgressBar from "../Materials/ProgressBar";
import Image from "next/image";
import { formatPriceToCLP } from "@/utils/parsePrice";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import GradientButton from "../Materials/GradientButton";
import LoadingComponent from "../Materials/LoadingComponent";
import DropdownMenu from "../Materials/DropdownMenu";
const useStyles = makeStyles()((_) => ({
  eventTitle: {
    fontWeight: "bold",
  },
  eventTitleColumn: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "200px",
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
  progress: {
    paddingRight: "16px",
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
  totalSelled: number;
  totalReselled: number;
  resellDeltaEarnings: number;
  totalReselledFee: number;
  resellFee: number;
};

// interface EventReviewActionsProps {
//   event: EventRow;
//   classes: Record<string, string>;
//   setEventStatus: (status: string, eventId: string) => void;
//   loading: boolean;
//   router?: NextRouter;
// }

const activatedStatus = ["Active", "Visible", "Expired", "Private"];

const useEventRows = (producerId: string) => {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (producerId === "") return;
    const unsubscribe = streamUserProducersEvents([producerId], (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => {
        const event = doc.data() as EventWithId;
        return {
          id: doc.id,
          eventName: event.info.name,
          eventStatus: event.info.status,
          eventStart: formatDate(event.info.start?.toDate() || new Date()),
          eventLocation: event.location.name,
          eventImage: event.info.image,
          ticketSelled: event.stats.ticketSelledCount,
          ticketTotal: event.stats.ticketTotal,
          totalSelled: event.stats.totalSelled,
          totalReselled: event.stats.totalReselled,
          resellDeltaEarnings: event.stats.resellDeltaEarnings,
          totalReselledFee: event.stats.totalReselledFee,
          resellFee: event.resell.resellFee,
        };
      });
      setRows(eventsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [producerId]);

  return { rows, loading, setLoading };
};

export default function ProducerEventsTable() {
  const { classes } = useStyles();
  const { producerId } = useProducerContext();
  const router = useRouter();
  const { rows, loading } = useEventRows(producerId);

  const handleRowClick = (_: number, eventId: string) => {
    router.push(`/producers/events/${eventId}`);
  };

  const columns = [
    {
      name: "eventImage",
      label: "Imagen",
      width: 90,
      options: {
        filter: false,
        sort: false,
        customBodyRender: (_: number, tableMeta: MUIDataTableMeta) => {
          const event = rows[tableMeta.rowIndex];
          if (!event) return;

          return (
            <Image
              src={event.eventImage}
              alt={event.eventName}
              style={{ width: "100px", height: "100px", borderRadius: "8px" }}
              height={60}
              width={60}
            />
          );
        },
      },
    },
    {
      name: "eventName",
      label: "Nombre",
      width: 200,
      options: {
        filter: false,
        sort: true,
        customBodyRender: (_: number, tableMeta: MUIDataTableMeta) => {
          const event = rows[tableMeta.rowIndex];
          if (!event) return;

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
        customBodyRender: (_: number, tableMeta: MUIDataTableMeta) => {
          const event = rows[tableMeta.rowIndex];
          if (!event) return;

          return activatedStatus.includes(event.eventStatus) ? (
            <div className={classes.progress}>
              <ProgressBar
                ticketSelled={event.ticketSelled}
                ticketTotal={event.ticketTotal}
              />
            </div>
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
        customBodyRender: (_: number, tableMeta: MUIDataTableMeta) => {
          const event = rows[tableMeta.rowIndex];
          if (!event) return;

          return activatedStatus.includes(event.eventStatus) ? (
            <div className={classes.eventTitle}>
              {formatPriceToCLP(
                event.totalReselled -
                  event.totalReselledFee +
                  (event.resellDeltaEarnings || 0) * (1 - event.resellFee) +
                  event.totalSelled
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
        customBodyRender: (_: number, tableMeta: MUIDataTableMeta) => {
          const event = rows[tableMeta.rowIndex];
          if (!event) return;

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
        customBodyRender: (_: number, tableMeta: MUIDataTableMeta) => {
          const event = rows[tableMeta.rowIndex];
          if (!event) return;

          return (
            <div
              className={classes.seeButton}
              onClick={() => handleRowClick(_, event.id)}
            >
              <ChevronRightRoundedIcon />
            </div>
          );
        },
      },
    },
  ];

  return (
    <div>
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
          title={"Mis Eventos"}
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
    </div>
  );
}
