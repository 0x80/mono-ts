import React, { type ChangeEvent } from "react";
import {
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
  TextField,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useStepperContext } from "@/context/StepperContext";
import type { Finance, EventForm } from "@/firebase/interfaces/events";

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

const EventFinance = () => {
  const { event, setEvent } = useStepperContext();

  const { classes } = useStyles();

  const handleChange =
    (key: keyof Finance) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEvent((prev: EventForm) => ({
        ...prev,
        finance: {
          ...prev.finance,
          [key]: e.target.value,
        },
      }));
    };

  const handleChangeSelect =
    (key: keyof Finance) => (e: SelectChangeEvent<string>) => {
      setEvent((prev: EventForm) => ({
        ...prev,
        finance: {
          ...prev.finance,
          [key]: e.target.value,
          serviceFeeHidden:
            e.target.value === "Fixed" ? false : prev.finance.serviceFeeHidden,
        },
      }));
    };

  const handleSwitchChange =
    (type: keyof EventForm) => (e: ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setEvent((prev: EventForm) => ({
        ...prev,
        [type]: {
          ...prev[type],
          [name]: checked,
        },
      }));
    };

  return (
    <form className={classes.column}>
      <div className={classes.row}>
        <p>
          1. Selecciona el tipo de costo de servicio (fijo para un valor fijo en
          CLP y porcentaje, para un porcentaje sobre el total)
        </p>
        <Select
          value={event.finance.serviceFeeType}
          onChange={handleChangeSelect("serviceFeeType")}
          fullWidth
        >
          <MenuItem value="Fixed">Fijo</MenuItem>
          <MenuItem value="Percentage">Porcentaje</MenuItem>
        </Select>
      </div>
      <div className={classes.row}>
        <p>2. Selecciona el valor del costo de servicio</p>
        <TextField
          value={event.finance.serviceFee}
          onChange={handleChange("serviceFee")}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          type="number"
          fullWidth
        />
      </div>
      {event.finance.serviceFeeType === "Percentage" && (
        <div className={classes.row}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  name="serviceFeeHidden"
                  checked={event.finance.serviceFeeHidden}
                  onChange={handleSwitchChange("finance")}
                />
              }
              label="3. Quieres que el costo de servicio este incluido en el precio de la entrada?"
            />
          </FormGroup>
        </div>
      )}

      <div className={classes.row}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                name="hasNonUserSell"
                checked={event.operations.hasNonUserSell}
                onChange={handleSwitchChange("operations")}
              />
            }
            label={
              (event.finance.serviceFeeType === "Percentage" ? 4 : 3) +
              ". Quieres que se pueda vender presencial sin crear usuario?"
            }
          />
        </FormGroup>
      </div>
    </form>
  );
};

export default EventFinance;
