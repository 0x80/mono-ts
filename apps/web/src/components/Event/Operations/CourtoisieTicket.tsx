import React, { type ChangeEvent, useState } from "react";

import { makeStyles } from "tss-react/mui";
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import LoadingButton from "../../Materials/LoadingButton";
import {
  generateTicketFunction,
  type GenerateTicketFunctionInput,
} from "@/firebase/functions/events/tickets/generate";
import type { EventWithId } from "@/firebase/interfaces/events";
import CSVUploader from "./CsvTicketUploader";
import {
  generateTicketsFromCSVFunction,
  type GenerateTicketsFromCSVFunctionInput,
} from "@/firebase/functions/events/tickets/generateTicketsFromCSV";

const useStyles = makeStyles()(() => ({
  adder: {
    display: "wrap",
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
    marginRight: "16px",
    marginBottom: "16px",
  },
  inputLabel: {
    color: "gray",
  },
  emailsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "400px",
    overflowY: "auto",
    margin: "32px 0",
  },
}));

export default function CourtoisieTicket({ event }: { event: EventWithId }) {
  const { classes } = useStyles();
  const [newEmail, setNewEmail] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [usingCSV, setUsingCSV] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const generateTicketHandler = async () => {
    setLoading(true);

    const input: GenerateTicketFunctionInput = {
      eventId: event.id,
      userMail: newEmail,
      metadata: metadata,
    };
    const result = await generateTicketFunction(input);
    setResult(result.data);
    if (result.data === "Ticket creado con exito") {
      setNewEmail("");
      setMetadata({});
    }
    setResult(result.data);

    setLoading(false);
  };

  const generateTicketsFromCSVHandler = async () => {
    setLoading(true);

    const input: GenerateTicketsFromCSVFunctionInput = {
      eventId: event.id,
      userMails: emails,
      metadata: metadata,
    };
    const result = await generateTicketsFromCSVFunction(input);
    setResult(result.data);
    setLoading(false);
  };

  const handleMetadataChange = (name: string, value: string) => {
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      [name]: value,
    }));
  };

  const renderMetadataField = (field: {
    name: string;
    label: string;
    type: string;
    options?: string[];
  }) => {
    if (field.type === "text") {
      return (
        <TextField
          key={field.name}
          id={`metadata-${field.name}`}
          label={field.label}
          variant="outlined"
          value={metadata[field.name] || ""}
          onChange={(e) => handleMetadataChange(field.name, e.target.value)}
          className={classes.textField}
        />
      );
    } else if (field.type === "select" && field.options) {
      return (
        <FormControl key={field.name} className={classes.textField}>
          <InputLabel className={classes.inputLabel}>{field.label}</InputLabel>
          <Select
            value={metadata[field.name] || ""}
            onChange={(e) =>
              handleMetadataChange(field.name, e.target.value as string)
            }
            displayEmpty
            labelId={`metadata-${field.name}-label`}
          >
            {field.options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
    return null;
  };

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUsingCSV(e.target.checked);
  };

  return (
    <div>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              name="hasUser"
              checked={usingCSV}
              onChange={handleSwitchChange}
            />
          }
          label="Deseas ocupar un archivo csv?"
        />
      </FormGroup>
      {!usingCSV ? (
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
            {event.operations.requiredMetadata &&
              event.operations.requiredMetadata.map(renderMetadataField)}

            <LoadingButton
              variant="contained"
              color="info"
              className={classes.button}
              onClick={() => void generateTicketHandler()}
              loading={loading}
            >
              Generar Ticket de Cortesia
            </LoadingButton>
          </div>
          {result && <h1>{result}</h1>}
        </div>
      ) : (
        <div>
          <CSVUploader
            onFileLoaded={(data) => {
              setEmails(data["email"] ?? []);
            }}
          ></CSVUploader>
          {emails.length > 0 && (
            <div>
              <div className={classes.emailsList}>
                {emails.map((email) => (
                  <div key={email}>{email}</div>
                ))}
              </div>
              <LoadingButton
                variant="contained"
                color="info"
                className={classes.button}
                onClick={() => void generateTicketsFromCSVHandler()}
                loading={loading}
              >
                Generar Tickets de Cortesia
              </LoadingButton>
            </div>
          )}{" "}
          {result && <h1>{result}</h1>}
        </div>
      )}
    </div>
  );
}
