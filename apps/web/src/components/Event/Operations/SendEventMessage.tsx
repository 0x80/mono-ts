import React, { useState } from "react";
import { TextField } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import type { EventWithId } from "@/firebase/interfaces/events";
import GradientButton from "@/components/Materials/GradientButton";
import { sendEventMessage } from "@/firebase/functions/events/sendEventMessage";

const useStyles = makeStyles()((_) => ({
  adder: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    margin: "0px 0px 32px 0px",
    maxWidth: "860px",
  },
  textField: {
    width: "100%",
    maxWidth: "400px",
    marginRight: "16px",
    marginBottom: "16px",
  },
  title: {
    marginBottom: "16px",
    fontWeight: "bold",
    fontSize: "18px",
  },
}));

const SendEventMessage = ({ event }: { event: EventWithId }) => {
  const { classes } = useStyles();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendEventMessage = async () => {
    setLoading(true);
    try {
      await sendEventMessage({
        eventImageUrl: event.info.image,
        eventId: event.id,
        subject,
        message,
      });
    } finally {
      setMessage("");
      setSubject("");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className={classes.title}>
        Enviar comunicado a los asistentes del evento
      </h1>
      <div className={classes.adder}>
        <TextField
          key={"subject"}
          id={`subject`}
          label={"Asunto"}
          variant="outlined"
          placeholder={"Información - " + event.info.name}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={classes.textField}
        />
        <TextField
          key={"message"}
          id={`message`}
          label={"Mensaje"}
          variant="outlined"
          placeholder={"Deben llegar 15 minutos antes del evento"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          className={classes.textField}
          rows={8}
        />

        <GradientButton
          variant="contained"
          color="primary"
          loading={loading}
          onClick={() => {
            handleSendEventMessage();
          }}
        >
          Enviar comunicado
        </GradientButton>
      </div>
    </div>
  );
};

export default SendEventMessage;
