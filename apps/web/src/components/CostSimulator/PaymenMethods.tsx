import { useCostContext } from "@/context/CostSimulatorContext";
import {
  Avatar,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import React, { type ChangeEvent } from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => ({
  card: {
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "16px",
  },
  column: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function CostSimulatorPaymentMethods() {
  const { classes } = useStyles();
  const { cost, setCost } = useCostContext();

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCost((prev) => ({
      ...prev,
      paymentMethods: {
        ...prev.paymentMethods,
        [event.target.name]: event.target.checked,
      },
    }));
  };

  return (
    <Card className={classes.card}>
      <CardContent>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={cost.paymentMethods.card}
                onChange={handleCheckboxChange}
              />
            }
            label={"Paga con tarjeta"}
            name="card"
          />
        </FormGroup>
        <div className={classes.column}>
          <Avatar
            alt="WebPay Oneclick"
            src="/webpay.jpg"
            sx={{ width: 72, height: 72 }}
          />
        </div>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={cost.paymentMethods.bank}
                onChange={handleCheckboxChange}
              />
            }
            label={"Paga con tu banco"}
            name="bank"
          />
        </FormGroup>
        <div className={classes.column}>
          <Avatar alt="Floid" src="/floid.jpg" sx={{ width: 72, height: 72 }} />
          <Avatar alt="Khipu" src="/khipu.png" sx={{ width: 72, height: 72 }} />
        </div>
      </CardContent>
    </Card>
  );
}
