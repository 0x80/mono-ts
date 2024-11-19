import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  errorFlex: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    fontSize: "1.5rem",
  },
}));
export default function Unauthorized() {
  const { classes } = useStyles();

  return (
    <div className={classes.errorFlex}>
      <h1>Ups! 401 🫡</h1>
      <p>No estas autorizado para acceder a esta pagina</p>
    </div>
  );
}
