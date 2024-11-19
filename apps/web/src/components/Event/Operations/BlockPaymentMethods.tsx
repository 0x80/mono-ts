import React, { type ChangeEvent, useState } from "react";
import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import type { EventWithId } from "@/firebase/interfaces/events";
import GradientButton from "@/components/Materials/GradientButton";
import { editBlockedPaymentMethodsFunction } from "@/firebase/functions/events/operations/editBlockedPaymentMethods";

const useStyles = makeStyles()((_) => ({
  adder: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    margin: "0px 0px 32px 0px",
    maxWidth: "860px",
  },
}));

const BlockPaymentMethods = ({ event }: { event: EventWithId }) => {
  const { classes } = useStyles();

  const [loading, setLoading] = useState(false);
  const [changed, setChanged] = useState(false);
  const [blockedMethods, setBlockedMethods] = useState<string[]>(
    event.operations.blockedPaymentMethods || []
  );

  const handleSwitchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const method = event.target.name;
    const newBlockedMethods = blockedMethods.includes(method)
      ? blockedMethods.filter((m) => m !== method)
      : [...blockedMethods, method];
    setBlockedMethods(newBlockedMethods);
    setChanged(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    await editBlockedPaymentMethodsFunction({
      eventId: event.id,
      options: blockedMethods,
    });
    setLoading(false);
    setChanged(false);
  };

  return (
    <div>
      <div className={classes.adder}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                name="khipu"
                checked={blockedMethods.includes("khipu")}
                onChange={handleSwitchChange}
              />
            }
            label="Khipu"
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                name="floid"
                checked={blockedMethods.includes("floid")}
                onChange={handleSwitchChange}
              />
            }
            label="Floid"
          />
        </FormGroup>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                name="card"
                checked={blockedMethods.includes("card")}
                onChange={handleSwitchChange}
              />
            }
            label="Card"
          />
        </FormGroup>
        <GradientButton
          onClick={() => {
            handleSubmit();
          }}
          loading={loading}
          disabled={!changed}
        >
          Guardar
        </GradientButton>
      </div>
    </div>
  );
};

export default BlockPaymentMethods;
