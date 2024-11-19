import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { streamEvent } from "@/firebase/db/events";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import { useAuthContext } from "@/context/AuthContext";
import Unauthorized from "@/components/Auth/Unauthorized";
import EventSummaryCard from "@/components/Event/Operations/SummaryCard";
import { useProducerContext } from "@/context/ProducerContext";
import { makeStyles } from "tss-react/mui";
import GoBack from "@/components/Materials/GoBack";
import { Box } from "@mui/material";
import type { Event } from "@/firebase/interfaces/events";
import EventTabs from "@/components/Event/EventTabs";

const useStyles = makeStyles()((_) => ({
  container: {
    backgroundColor: "#fff",
  },
}));
const activatedStatus = ["Active", "Expired", "Visible", "Private"];

export default function ProducerEventPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const router = useRouter();
  const eventId = router.query.eventId as string;
  const { isAdmin } = useAuthContext();
  const { producerId } = useProducerContext();
  const { classes } = useStyles();

  useEffect(() => {
    const unsubscribe = streamEvent(
      eventId,
      (snapshot) => {
        setEvent(snapshot.data() as Event);
      },
      () => {
        return;
      }
    );
    return () => unsubscribe();
  }, [eventId]);

  return event ? (
    isAdmin || producerId === event?.producer.id ? (
      <Box className={classes.container}>
        <GoBack
          text={isAdmin ? "Volver a eventos" : "Volver a mis eventos"}
          route={isAdmin ? "/admin/events" : "/producers/events"}
        />

        <EventSummaryCard event={event} eventId={eventId} />

        {activatedStatus.includes(event.info.status) && (
          <EventTabs event={event} eventId={eventId} />
        )}
      </Box>
    ) : (
      <Unauthorized />
    )
  ) : (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <LoadingComponent />
    </Box>
  );
}
