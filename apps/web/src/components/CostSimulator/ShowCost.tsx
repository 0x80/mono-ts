import { useCostContext } from "@/context/CostSimulatorContext";
import { Card, CardContent } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  card: {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    width: 300,
    height: 300,
  },
  message: {
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "32px",
  },
  total: {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  costCard: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    width: 232,
    borderRadius: 8,
    backgroundColor: theme.palette.secondary.main,
  },
}));

export default function CostSimulatorShowCost() {
  const { classes } = useStyles();
  const { cost } = useCostContext();

  return (
    <Card className={classes.card}>
      <CardContent>
        <div className={classes.title}>Comisión por venta</div>
        {cost.total > 0 ? (
          <div className={classes.costCard}>
            <div className={classes.total}>{cost.total}% + IVA</div>
          </div>
        ) : (
          <div className={classes.message}>
            Para iniciar el simulador elige alguna opción
          </div>
        )}
      </CardContent>
    </Card>
  );
}
