import React, { type ChangeEvent } from "react";
import { makeStyles } from "tss-react/mui";
import { TextField } from "@mui/material";
import { useStepperContext } from "@/context/StepperContext";
import type { EventForm } from "@/firebase/interfaces/events";

const useStyles = makeStyles()(() => ({
  row: {
    gap: "20px",
    display: "flex",
    flexDirection: "row",
    alignItems: "start",
  },

  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    gap: "20px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginBottom: "20px",
  },
}));

type WeekDayLabel = {
  name: string;
  slug: string;
};

const EventWeekDay = ({ weekDayLabel }: { weekDayLabel: WeekDayLabel }) => {
  const { classes } = useStyles();
  const { event, setEvent } = useStepperContext();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEvent((prev: EventForm) => ({
      ...prev,
      weekSchedule: {
        ...prev.weekSchedule,
        [weekDayLabel.slug]: {
          ...prev.weekSchedule[weekDayLabel.slug],
          [event.target.name]: Number(event.target.value),
          start: prev.weekSchedule[weekDayLabel.slug]?.start ?? 0,
          end: prev.weekSchedule[weekDayLabel.slug]?.end ?? 0,
          ticketTotal: prev.weekSchedule[weekDayLabel.slug]?.ticketTotal ?? 0,
          slotRange: prev.weekSchedule[weekDayLabel.slug]?.slotRange ?? 0,
        },
      },
    }));
  };

  const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const hours = e.target.value.split(":")[0] ?? "0";
    const minutes = e.target.value.split(":")[1] ?? "0";
    setEvent((prev: EventForm) => ({
      ...prev,
      weekSchedule: {
        ...prev.weekSchedule,
        [weekDayLabel.slug]: {
          ...prev.weekSchedule[weekDayLabel.slug],
          [e.target.name]: parseInt(hours) * 60 + parseInt(minutes),
          start: prev.weekSchedule[weekDayLabel.slug]?.start ?? 0,
          end: prev.weekSchedule[weekDayLabel.slug]?.end ?? 0,
          ticketTotal: prev.weekSchedule[weekDayLabel.slug]?.ticketTotal ?? 0,
          slotRange: prev.weekSchedule[weekDayLabel.slug]?.slotRange ?? 0,
        },
      },
    }));
  };

  const parseHoursToString = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    // Calculate the remaining minutes
    const mins = minutes % 60;

    // Format hours and minutes to be two digits if they are less than 10
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = mins.toString().padStart(2, "0");

    // Combine hours and minutes into the desired format
    return `${formattedHours}:${formattedMinutes}`;
  };

  return (
    <div className={classes.card}>
      <h3>{weekDayLabel.name}</h3>
      <div className={classes.row}>
        <TextField
          id="time"
          type="time"
          label="Inicio"
          name="start"
          sx={{ width: 140 }}
          InputLabelProps={{
            shrink: true,
          }}
          value={parseHoursToString(
            event.weekSchedule?.[weekDayLabel.slug]?.start ?? 0
          )}
          onChange={handleTimeChange}
        />
        <TextField
          id="time"
          type="time"
          label="Término"
          name="end"
          sx={{ width: 140 }}
          InputLabelProps={{
            shrink: true,
          }}
          value={parseHoursToString(
            event.weekSchedule?.[weekDayLabel.slug]?.end ?? 0
          )}
          onChange={handleTimeChange}
        />
      </div>
      <TextField
        id="outlined-number"
        label="Cada cuantos minutos se repite el horario"
        type="number"
        name="slotRange"
        InputLabelProps={{
          shrink: true,
        }}
        sx={{ width: 300 }}
        onChange={handleChange}
        onWheel={(e) => (e.target as HTMLElement).blur()}
        value={event.weekSchedule?.[weekDayLabel.slug]?.slotRange}
        InputProps={{ inputProps: { min: 0 } }}
      />
      <TextField
        id="outlined-number"
        label="Total de tickets por horario"
        type="number"
        onWheel={(e) => (e.target as HTMLElement).blur()}
        name="ticketTotal"
        InputLabelProps={{
          shrink: true,
        }}
        onChange={handleChange}
        value={event.weekSchedule?.[weekDayLabel.slug]?.ticketTotal}
        sx={{ width: 300 }}
        InputProps={{ inputProps: { min: 0 } }}
      />
    </div>
  );
};

export default EventWeekDay;
