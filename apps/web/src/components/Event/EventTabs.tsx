import React from "react";
import { makeStyles } from "tss-react/mui";
import AdminEventAccountablity from "./Dashboard/AdminEventAccountablity";
import type { Event } from "@/firebase/interfaces/events";
import EventAccountablity from "./Dashboard/EventAccountability";
import { useAuthContext } from "@/context/AuthContext";
import EventOperations from "./Operations/Operations";
import EventTickets from "./Tickets/Tickets";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventOrders from "../Orders/EventOrders";

const useStyles = makeStyles()(() => ({
  tabsContent: {
    width: "100%",
  },
}));

export default function EventTabs({
  event,
  eventId,
}: {
  event: Event;
  eventId: string;
}) {
  const { isAdmin } = useAuthContext();
  const { classes } = useStyles();

  return (
    <Tabs defaultValue="dashboard" className={classes.tabsContent}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="operations">Operaciones</TabsTrigger>
        <TabsTrigger value="tickets">Tickets</TabsTrigger>
        <TabsTrigger value="orders">Órdenes</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard">
        {isAdmin ? (
          <AdminEventAccountablity event={event} eventId={eventId} />
        ) : (
          <EventAccountablity event={event} eventId={eventId} />
        )}
      </TabsContent>
      <TabsContent value="operations">
        <EventOperations event={event} />
      </TabsContent>
      <TabsContent value="tickets">
        <EventTickets event={event} eventId={eventId} />
      </TabsContent>
      <TabsContent value="orders">
        <EventOrders event={event} eventId={eventId} />
      </TabsContent>
    </Tabs>
  );
}
