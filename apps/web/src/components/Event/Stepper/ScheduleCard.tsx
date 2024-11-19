import React, { type ChangeEvent, Fragment } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import { FormControlLabel, FormGroup, Switch, TextField } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import type { ScheduleForm } from "@/firebase/interfaces/events";

const useStyles = makeStyles()(() => ({
  textField: {
    marginBottom: "16px",
  },
  card: {
    margin: "32px 0px",
  },
}));

export default function ScheduleCard({
  handleDeleteSchedule,
  schedule,
  handleChangeSchedule,
  handleSwitchSchedule,
}: {
  schedule: ScheduleForm;
  handleDeleteSchedule: (id: string) => void;
  handleChangeSchedule: (
    id: string
  ) => (
    key: keyof ScheduleForm
  ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSwitchSchedule: (id: string) => void;
}) {
  const { classes } = useStyles();
  return (
    <Box sx={{ minWidth: 275 }}>
      <Card variant="outlined" className={classes.card}>
        <Fragment>
          <CardContent>
            <div className={classes.textField}>
              <TextField
                id="outlined-basic"
                label="Nombre de la entrada"
                variant="outlined"
                fullWidth
                onChange={handleChangeSchedule(schedule.id)("name")}
                value={schedule.name}
              />
            </div>
            <div className={classes.textField}>
              <TextField
                id="outlined-basic"
                label="Descripción de la entrada (Dejar en blanco si no es necesario)"
                variant="outlined"
                fullWidth
                onChange={handleChangeSchedule(schedule.id)("description")}
                value={schedule.description}
              />
            </div>
            <div className={classes.textField}>
              <TextField
                id="outlined-basic"
                label="Precio de la entrada (CLP)"
                variant="outlined"
                type="number"
                onWheel={(e) => (e.target as HTMLElement).blur()}
                fullWidth
                onChange={handleChangeSchedule(schedule.id)("price")}
                value={schedule.price}
              />
            </div>
            <div className={classes.textField}>
              <TextField
                id="outlined-basic"
                label="Cantidad total de entradas"
                variant="outlined"
                type="number"
                fullWidth
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onChange={handleChangeSchedule(schedule.id)("ticketTotal")}
                value={schedule.ticketTotal}
              />
            </div>
            <div className={classes.textField}>
              <TextField
                id="outlined-basic"
                label="Cantidad de máxima de entradas por persona"
                variant="outlined"
                type="number"
                fullWidth
                onWheel={(e) => (e.target as HTMLElement).blur()}
                onChange={handleChangeSchedule(schedule.id)("maxTicketPerBuy")}
                value={schedule.maxTicketPerBuy}
              />
            </div>
            <div className={classes.textField}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={schedule.type === "unique"}
                      onChange={() => handleSwitchSchedule(schedule.id)}
                    />
                  }
                  label="Esta entrada es exclusiva? (Solamente podras comprar una entrada exclusiva y tu email debe pertenecer a los dominios marcados en la productora)"
                />
              </FormGroup>
            </div>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="error"
              onClick={() => handleDeleteSchedule(schedule.id)}
            >
              Eliminar
            </Button>
          </CardActions>
        </Fragment>
      </Card>
    </Box>
  );
}
