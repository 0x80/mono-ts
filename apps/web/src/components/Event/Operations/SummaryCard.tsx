import React, { useState } from "react";
import { makeStyles } from "tss-react/mui";
import type { Event } from "@/firebase/interfaces/events";
import { formatDate } from "@/utils/formatDate";
import StatusLabel from "./StatusLabel";
import DashboardSummary from "../Dashboard/DashboardSummary";
import Image from "next/image";
import GradientButton from "@/components/Materials/GradientButton";
import { useRouter } from "next/router";
import { setEventStatusFunction } from "@/firebase/functions/events/setEventStatus";
import { useAuthContext } from "@/context/AuthContext";

const useStyles = makeStyles()((_) => ({
  body: {},
  title: {
    fontSize: "48px",
    fontWeight: 700,
    color: "black",
  },
  subTitle: {
    fontSize: "18px",
    color: "grey",
    marginBottom: "32px",
    maxWidth: "500px",
  },
  eventInfo: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "32px",
    padding: "16px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    },
    borderRadius: "8px",
  },
  status: {
    maxWidth: "200px",
    display: "flex",
  },
  expandedRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: "32px",
  },
  spaceBetweenRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    flexWrap: "wrap",
    gap: "32px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
  },
}));

const activatedStatus = ["Active", "Expired", "Visible", "Private"];

type EventSummaryCardProps = {
  event: Event;
  eventId: string;
};

const EventSummaryCard: React.FC<EventSummaryCardProps> = ({
  event,
  eventId,
}) => {
  const { classes } = useStyles();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isProducer } = useAuthContext();
  const setEventStatus = async (status: string) => {
    setLoading(true);
    await setEventStatusFunction({ eventId: eventId, status });
    setLoading(false);
  };
  return (
    <div className={classes.body}>
      <div className={classes.eventInfo}>
        <div className={classes.expandedRow}>
          <div className={classes.spaceBetweenRow}>
            <Image
              height={150}
              width={150}
              src={event.info.image}
              alt={event.info.name}
              style={{
                width: "150px",
                height: "150px",
                borderRadius: "8px",
                marginRight: "32px",
              }}
            />
            <div className={classes.column}>
              <h1 className={classes.title}>{event.info.name}</h1>
              <h2 className={classes.subTitle}>
                {formatDate(event.info.start?.toDate())} - {event.location.name}{" "}
                - {event.location.address}
              </h2>
            </div>
          </div>
          <div className={classes.status}>
            <StatusLabel status={event.info.status} />
          </div>
        </div>
        {activatedStatus.includes(event.info.status) ? (
          <DashboardSummary event={event} />
        ) : (
          <div className={classes.spaceBetweenRow}>
            <GradientButton
              color="secondary"
              onClick={() => void router.push(`/events/${eventId}/edit`)}
            >
              Editar
            </GradientButton>

            {event.info.status === "Draft" && isProducer && (
              <GradientButton
                color="primary"
                loading={loading}
                onClick={() => void setEventStatus("InReview")}
              >
                Mandar a revisión
              </GradientButton>
            )}
            {event.info.status === "InReview" && isProducer && (
              <GradientButton
                color="error"
                variant="contained"
                loading={loading}
                onClick={() => void setEventStatus("Draft")}
              >
                Cancelar revisión
              </GradientButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventSummaryCard;
