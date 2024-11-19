import React, { type ChangeEvent } from "react";
import { FormControlLabel, FormGroup, Switch, TextField } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useStepperContext } from "@/context/StepperContext";
import type { Resell, EventForm } from "@/firebase/interfaces/events";

const useStyles = makeStyles()(() => ({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
  row: {
    marginTop: "32px",
    maxWidth: "500px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    gap: "16px",
  },
}));

const EventResell = () => {
  const { event, setEvent } = useStepperContext();

  const { classes } = useStyles();

  const handleChange =
    (key: keyof Resell) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEvent((prev: EventForm) => ({
        ...prev,
        resell: {
          ...prev.resell,
          [key]: e.target.value,
        },
      }));
    };

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "hasResell" && !e.target.checked) {
      setEvent((prev: EventForm) => ({
        ...prev,
        resell: {
          hasResell: false,
          resellFee: 0,
          resellQueueNumber: 0,
          resellHighestPrice: false,
        },
      }));
      return;
    }
    setEvent((prev: EventForm) => ({
      ...prev,
      resell: {
        ...prev.resell,
        [e.target.name]: e.target.checked,
      },
    }));
  };

  return (
    <form className={classes.column}>
      <div className={classes.row}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                name="hasResell"
                checked={event.resell.hasResell}
                onChange={handleSwitchChange}
              />
            }
            label="1. El evento permite reventa?"
          />
        </FormGroup>
      </div>
      {event.resell.hasResell && (
        <>
          <div className={classes.row}>
            <p>2. Porcentaje de la comisión de la reventa</p>
            <TextField
              value={event.resell.resellFee}
              onChange={handleChange("resellFee")}
              type="number"
              onWheel={(e) => (e.target as HTMLElement).blur()}
              fullWidth
            />
          </div>
          <div className={classes.row}>
            <p>
              3. (Numero entero) Cada cuantas entradas vendidas se vende una
              reventa (dejar en 0 si la reventa es siempre prioridad)
            </p>
            <TextField
              value={event.resell.resellQueueNumber}
              onChange={handleChange("resellQueueNumber")}
              type="number"
              onWheel={(e) => (e.target as HTMLElement).blur()}
              fullWidth
            />
          </div>
          <div className={classes.row}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    name="resellHighestPrice"
                    checked={event.resell.resellHighestPrice}
                    onChange={handleSwitchChange}
                  />
                }
                label="3. Se revende al precio mas alto disponible? (Si no, se revende la entrada de la misma categoria)"
              />
            </FormGroup>
          </div>
        </>
      )}
    </form>
  );
};

export default EventResell;
