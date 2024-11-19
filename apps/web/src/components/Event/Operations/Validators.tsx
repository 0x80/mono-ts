import React, { useState } from "react";

import { makeStyles } from "tss-react/mui";
import AlgoliaTable from "../../Materials/Table";
import { TableCell, TableRow, TextField } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import type { EventWithId } from "@/firebase/interfaces/events";
import LoadingButton from "../../Materials/LoadingButton";
import { updateEventValidatorsFunction } from "@/firebase/functions/events/updateEventValidators";

const useStyles = makeStyles()(() => ({
  removeIcon: {
    color: "red",
    cursor: "pointer",
  },
  adder: {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    margin: "0px 0px 32px 0px",
  },
  button: {
    maxWidth: "180px",
  },
  textField: {
    width: "100%",
    maxWidth: "400px",
  },
}));
export default function Validators({ event }: { event: EventWithId }) {
  const { classes } = useStyles();
  const [newEmail, setNewEmail] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  const handleRemove = async (uid: string) => {
    await updateEventValidatorsFunction({
      eventId: event.id,
      operations: {
        validatorsData: event.operations.validatorsData.filter(
          (validator) => validator.uid !== uid
        ),
        validators: event.operations.validators.filter(
          (validator) => validator !== uid
        ),
        requiredMetadata: event.operations.requiredMetadata,
        hasNonUserSell: event.operations.hasNonUserSell,
        blockedPaymentMethods: event.operations.blockedPaymentMethods,
      },
      isAdd: false,
      newEmail: "",
    });
  };

  const handleAdd = async (email: string) => {
    setButtonLoading(true);
    await updateEventValidatorsFunction({
      eventId: event.id,
      operations: event.operations,
      isAdd: true,
      newEmail: email,
    });
    setNewEmail("");
    setButtonLoading(false);
  };

  return (
    <div>
      <div className={classes.adder}>
        <TextField
          id="outlined-basic"
          label="Correo"
          variant="outlined"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className={classes.textField}
        />
        <LoadingButton
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={() => void handleAdd(newEmail)}
          loading={buttonLoading}
        >
          Agregar
        </LoadingButton>
      </div>
      <AlgoliaTable headers={["Correo", ""]}>
        <>
          {event.operations &&
            event.operations.validatorsData.map((validator) => (
              <Row
                key={validator.uid}
                validator={validator}
                handleRemove={handleRemove}
              />
            ))}
        </>
      </AlgoliaTable>
    </div>
  );
}

function Row({
  validator,
  handleRemove,
}: {
  validator: { uid: string; email: string };
  handleRemove: (email: string) => Promise<void>;
}) {
  const { classes } = useStyles();
  // substract activationdate

  return (
    <TableRow key={validator.uid}>
      <TableCell>{validator.email}</TableCell>
      <TableCell>
        <RemoveCircleIcon
          className={classes.removeIcon}
          onClick={() => void handleRemove(validator.uid)}
        ></RemoveCircleIcon>
      </TableCell>
    </TableRow>
  );
}
