import React from "react";

import WithAuth from "@/components/Auth/WithAuth";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
    gap: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "600",
  },
  subtitle: { fontSize: "20px" },
}));
export default function AdminHome() {
  const { classes } = useStyles();
  return (
    <WithAuth admin>
      <div className={classes.column}>
        <h1 className={classes.title}>Bienvenido de vuelta 👋</h1>
        <p className={classes.subtitle}>
          Aquí puedes visualizar toda la información
        </p>
      </div>
    </WithAuth>
  );
}
