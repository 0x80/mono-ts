import React, { type ChangeEvent, useState } from "react";
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
import { makeStyles } from "tss-react/mui";
import type { EventWithId } from "@/firebase/interfaces/events";
import LoadingButton from "../../Materials/LoadingButton";
import {
  createPresencialOrderFunction,
  type CreatePresencialOrderFunctionInput,
  type TicketCount,
} from "@/firebase/functions/orders/createPresenciaOrder";
import { getActivationDate } from "@/utils/getActivationDate";
import { formatDateAndTime } from "@/utils/formatDateAndTime";

const useStyles = makeStyles()((_) => ({
  adder: {
    display: "wrap",
    flexDirection: "row",
    gap: "16px",
    margin: "0px 0px 32px 0px",
    maxWidth: "860px",
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
  options: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "16px",
  },
}));

const GenerateTicketForm = ({ event }: { event: EventWithId }) => {
  const { classes } = useStyles();
  const [user, setUser] = useState({ email: "", dni: "", displayName: "" });
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [metadataDouble, setMetadataDouble] = useState<Record<string, string>>(
    {}
  );
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDouble, setIsDouble] = useState(false);
  const [hasUser, setHasUser] = useState(!event.operations.hasNonUserSell);
  const [getUserByDni, setGetUserByDni] = useState(false);

  const generateTicketHandler = async () => {
    setLoading(true);
    const ticketCount: TicketCount[] = event.schedule.map((schedule) => ({
      name: schedule.name,
      count: schedule.name === selectedSchedule ? 1 : 0,
    }));

    const { dateString, timeString } = formatDateAndTime(
      event.info.start?.toDate() as Date
    );
    const activationDate = getActivationDate(
      event.info.start?.toDate(),
      event.info.activationDate
    );

    const input: CreatePresencialOrderFunctionInput = {
      calculateTotal: {
        ticketCount,
        eventId: event.id,
        concurrentDate: 0,
        date: dateString,
        hour: timeString,
        expirationDate: "",
        isWeb: true,
        isEventActivated: activationDate < new Date(),
        metadata: {
          [`${selectedSchedule}-0`]: { ...metadata },
          ...(isDouble
            ? { [`${selectedSchedule}-1`]: { ...metadataDouble } }
            : {}),
        },
      },
      email: user.email,
      dni: user.dni,
      displayName: user.displayName,
      hasUser,
      getUserByDni,
    };

    const result = await createPresencialOrderFunction(input);
    setResult(result.data);
    if (result.data === "Ticket creado con exito") {
      resetForm();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setUser({ email: "", dni: "", displayName: "" });
    setMetadata({});
    setMetadataDouble({});
    setIsDouble(false);
    setSelectedSchedule("");
  };

  const handleMetadataChange = (
    name: string,
    value: string,
    isDouble: boolean
  ) => {
    if (isDouble) {
      setMetadataDouble((prev) => ({ ...prev, [name]: value }));
    } else {
      setMetadata((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "getUserByDni") setGetUserByDni(e.target.checked);
    else {
      setHasUser(e.target.checked);
      setGetUserByDni(false);
    }
  };

  const handleScheduleChange = (value: string) => {
    setSelectedSchedule(value as string);
    if (!value) return;
    const schedule = event.schedule.find((sch) => sch.name === value);
    setIsDouble(schedule!.type === "double");
    if (!schedule || schedule.type !== "double") setMetadataDouble({});
  };

  const renderMetadataField = (field: {
    name: string;
    label: string;
    type: string;
    isDouble: boolean;
    options?: string[];
  }) => {
    const value = field.isDouble
      ? metadataDouble[field.name] || ""
      : metadata[field.name] || "";
    const onChange = (e: ChangeEvent<HTMLInputElement>) =>
      handleMetadataChange(field.name, e.target.value, field.isDouble);

    return field.type === "text" ? (
      <TextField
        key={field.name}
        label={field.label}
        variant="outlined"
        value={value}
        onChange={onChange}
        className={classes.textField}
      />
    ) : (
      field.options && (
        <FormControl key={field.name} className={classes.textField}>
          <InputLabel className={classes.inputLabel}>{field.label}</InputLabel>
          <Select
            value={value}
            onChange={(e) =>
              handleMetadataChange(
                field.name,
                e.target.value as string,
                field.isDouble
              )
            }
            displayEmpty
          >
            {field.options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )
    );
  };

  return (
    <div>
      <div className={classes.adder}>
        <div className={classes.options}>
          {event.operations.hasNonUserSell && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    name="hasUser"
                    checked={hasUser}
                    onChange={handleSwitchChange}
                  />
                }
                label="Tiene un usuario registrado?"
              />
            </FormGroup>
          )}
          {hasUser && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    name="getUserByDni"
                    checked={getUserByDni}
                    onChange={handleSwitchChange}
                  />
                }
                label="Buscar usuario por DNI (Sin puntos ni guión)"
              />
            </FormGroup>
          )}
        </div>
        {getUserByDni ? (
          <TextField
            label="DNI"
            variant="outlined"
            placeholder="Sin puntos ni guión"
            value={user.dni}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, dni: e.target.value }))
            }
            className={classes.textField}
          />
        ) : (
          <TextField
            label="Correo"
            variant="outlined"
            value={user.email}
            onChange={(e) =>
              setUser((prev) => ({ ...prev, email: e.target.value }))
            }
            className={classes.textField}
          />
        )}
        {!hasUser && (
          <>
            <TextField
              label="Nombre y Apellido"
              variant="outlined"
              value={user.displayName}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, displayName: e.target.value }))
              }
              className={classes.textField}
            />
            <TextField
              label="DNI"
              variant="outlined"
              value={user.dni}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, dni: e.target.value }))
              }
              className={classes.textField}
            />
          </>
        )}
        {event.operations.requiredMetadata?.map((field) =>
          renderMetadataField({ ...field, isDouble: false })
        )}
        {isDouble &&
          event.operations.requiredMetadata?.map((field) =>
            renderMetadataField({ ...field, isDouble: true })
          )}
        <FormControl className={classes.textField}>
          <InputLabel className={classes.inputLabel}>Tipo de ticket</InputLabel>
          <Select
            value={selectedSchedule}
            onChange={(e) => handleScheduleChange(e.target.value)}
            displayEmpty
          >
            {event.schedule.map((sch) => (
              <MenuItem key={sch.name} value={sch.name}>
                {sch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <LoadingButton
          variant="contained"
          color="info"
          className={classes.button}
          onClick={() => {
            generateTicketHandler();
          }}
          loading={loading}
        >
          Generar Ticket
        </LoadingButton>
      </div>
      {result && <h1>{result}</h1>}
    </div>
  );
};

export default GenerateTicketForm;
