import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  column: {
    margin: "32px",
  },

  title: {
    fontSize: "24px",
    fontWeight: "600",
  },
  card: {
    display: "flex",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    borderRadius: "8px",
    padding: "32px",
    backgroundColor: "white",
    color: "black",
    minHeight: "180px",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: "16px",
  },
}));

export default function NoProducer() {
  const { classes } = useStyles();

  return (
    <div className={classes.column}>
      <div className={classes.card}>
        <div className={classes.row}>
          <div>
            <h1 className={classes.title}>
              Por favor selecciona una productora arriba a la derecha
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
