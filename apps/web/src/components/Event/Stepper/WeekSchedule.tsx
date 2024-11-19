import React from "react";
import { makeStyles } from "tss-react/mui";
import EventWeekDay from "./WeekDayCard";

const useStyles = makeStyles()(() => ({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
  card: {
    display: "flex",
    alignItems: "start",
    gap: "20px",
    padding: "20px",
    width: "100%",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
}));

const EventWeekSchedule = () => {
  const { classes } = useStyles();
  return (
    <div className={classes.column}>
      <p>0. Establece el horario</p>
      <div className={classes.card}>
        <EventWeekDay weekDayLabel={{ name: "Lunes", slug: "monday" }} />
        <EventWeekDay weekDayLabel={{ name: "Martes", slug: "tuesday" }} />
        <EventWeekDay weekDayLabel={{ name: "Miércoles", slug: "wednesday" }} />
        <EventWeekDay weekDayLabel={{ name: "Jueves", slug: "thursday" }} />
        <EventWeekDay weekDayLabel={{ name: "Viernes", slug: "friday" }} />
        <EventWeekDay weekDayLabel={{ name: "Sábado", slug: "saturday" }} />
        <EventWeekDay weekDayLabel={{ name: "Domingo", slug: "sunday" }} />
      </div>
    </div>
  );
};

export default EventWeekSchedule;
