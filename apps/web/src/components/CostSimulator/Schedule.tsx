import { Card, CardContent, IconButton } from "@mui/material";
import React from "react";
import { makeStyles } from "tss-react/mui";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { formatPriceToCLP } from "@/utils/parsePrice";

const useStyles = makeStyles()((theme) => ({
  card: {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "16px",
  },
  metadataItem: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
  },
  removeIcon: {
    marginLeft: "10px",
    cursor: "pointer",
  },
  quantity: {
    fontWeight: "bold",
    marginRight: "4px",
  },
  price: {
    backgroundColor: theme.palette.secondary.main,
    color: "white",
    padding: "8px",
    borderRadius: "4px",
    marginLeft: "8px",
  },
}));

export default function CostSimulatorSchedule() {
  const { classes } = useStyles();
  const quantity = 500;
  const price = 50000;

  return (
    <Card className={classes.card}>
      <CardContent>
        <div className={classes.metadataItem}>
          <p>
            <span className={classes.quantity}>{quantity}</span> X
            <span className={classes.price}>{formatPriceToCLP(price)}</span>
          </p>

          <IconButton
            onClick={() => {
              return;
            }}
            className={classes.removeIcon}
          >
            <RemoveCircleIcon color="error" />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}
