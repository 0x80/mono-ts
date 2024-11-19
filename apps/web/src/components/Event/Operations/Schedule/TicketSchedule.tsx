import type { EventWithId, Schedule } from "@/firebase/interfaces/events";
import React from "react";
import { makeStyles } from "tss-react/mui";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import TicketScheduleActions from "./TicketScheduleActions";
import ProgressBar from "@/components/Materials/ProgressBar";
import AddTicketSchedule from "./AddTicketSchedule";
import { useAuthContext } from "@/context/AuthContext";

const useStyles = makeStyles()((_) => ({
  scheduleCard: {
    borderRadius: "8px",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    minHeight: "120px",
    padding: "16px 24px",
    maxWidth: "800px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "24px",
    border: "1px solid #E0E0E0",
    gap: "32px",
  },
  scheduleCardTitle: {
    display: "flex",
    flexDirection: "column",
  },
  scheduleCardRow: {
    display: "flex",
    flexDirection: "row",
    gap: "32px",
  },
  scheduleCardColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "50px",
    gap: "8px",
  },
  scheduleCardButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "80px",
    gap: "8px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  titleCard: {
    fontSize: "12px",
    fontWeight: "normal",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "12px",
    fontWeight: "normal",
    color: "#828282",
  },
  subtitleCard: {
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
  },
  scheduleContainer: {
    marginBottom: "32px",
  },
  progress: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100px",
  },
}));

const typeTranslation = (type: string) => {
  switch (type) {
    case "private":
      return "Privado";
    case "unique":
      return "Único";
    case "double":
      return "Doble";
    default:
      return "Normal";
  }
};

const ScheduleCard = ({
  scheduleItem,
  eventId,
}: {
  scheduleItem: Schedule;
  eventId: string;
}) => {
  const { classes } = useStyles();
  return (
    <div className={classes.scheduleCard}>
      <div className={classes.scheduleCardTitle}>
        <div className={classes.title}>{scheduleItem.name}</div>
        <div className={classes.subtitle}>{scheduleItem.description}</div>
      </div>
      <div className={classes.scheduleCardRow}>
        <div className={classes.scheduleCardColumn}>
          <div className={classes.titleCard}>Tipo</div>
          <div className={classes.subtitleCard}>
            {typeTranslation(scheduleItem.type)}
          </div>
        </div>
        <>
          <div className={classes.progress}>
            <ProgressBar
              ticketSelled={scheduleItem.ticketSelledCount}
              ticketTotal={scheduleItem.ticketTotal}
            />
          </div>

          <div className={classes.scheduleCardColumn}>
            {(scheduleItem.visible ?? true) ? (
              <VisibilityRoundedIcon color="info" />
            ) : (
              <VisibilityOffRoundedIcon color="error" />
            )}
          </div>
          <div className={classes.scheduleCardButton}>
            <TicketScheduleActions
              scheduleItem={scheduleItem}
              eventId={eventId}
              action="edit"
            />
          </div>
          <div className={classes.scheduleCardButton}>
            <TicketScheduleActions
              scheduleItem={scheduleItem}
              eventId={eventId}
              action="deplete"
            />
          </div>
        </>
      </div>
    </div>
  );
};

export default function TicketSchedule({ event }: { event: EventWithId }) {
  const { classes } = useStyles();
  const { isAdmin } = useAuthContext();
  return (
    <div className={classes.scheduleContainer}>
      {event.schedule.map((scheduleItem: Schedule) => (
        <ScheduleCard
          key={scheduleItem.name}
          scheduleItem={scheduleItem}
          eventId={event.id}
        />
      ))}
      {isAdmin && <AddTicketSchedule eventId={event.id} />}
    </div>
  );
}
