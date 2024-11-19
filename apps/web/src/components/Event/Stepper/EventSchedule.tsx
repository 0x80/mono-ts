import React, { type ChangeEvent, useState } from "react";
import { makeStyles } from "tss-react/mui";
import { useStepperContext } from "@/context/StepperContext";
import ScheduleCard from "./ScheduleCard";
import { v4 as uuidv4 } from "uuid";
import EventWeekSchedule from "./WeekSchedule";
import LoadingButton from "@/components/Materials/LoadingButton";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

import {
  FormControlLabel,
  FormGroup,
  Switch,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Chip,
} from "@mui/material";
import type {
  ScheduleForm,
  Info,
  EventForm,
} from "@/firebase/interfaces/events";

const useStyles = makeStyles()(() => ({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
  row: {
    marginTop: "32px",
    maxWidth: "500px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
  button: {
    marginTop: "20px",
  },
  metadataForm: {
    marginTop: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  metadataItem: {
    display: "flex",
    start: "center",
    marginTop: "10px",
    justifyContent: "start",
  },
  removeIcon: {
    marginLeft: "10px",
    cursor: "pointer",
  },
  optionsChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },
}));

const EventSchedule = () => {
  const { event, setEvent } = useStepperContext();
  const [metadataLabel, setMetadataLabel] = useState("");
  const [metadataType, setMetadataType] = useState("text");
  const [metadataOptions, setMetadataOptions] = useState("");
  const [metadataObligatory, setMetadataObligatory] = useState(false);

  const { classes } = useStyles();

  const handleAddSchedule = () => {
    const newSchedule: ScheduleForm = {
      name: "",
      price: 0,
      maxTicketPerBuy: 0,
      ticketTotal: 0,
      id: uuidv4(),
      type: "normal",
      description: "",
    };
    setEvent((prev: EventForm) => ({
      ...prev,
      schedule: [...prev.schedule, newSchedule],
    }));
  };

  const handleDeleteSchedule = (id: string) => {
    const newSchedule = event.schedule.filter(
      (item: ScheduleForm, _: number) => item.id !== id
    );
    setEvent((prev: EventForm) => ({
      ...prev,
      schedule: newSchedule,
    }));
  };

  const handleChangeSchedule =
    (id: string) =>
    (key: string | number | symbol) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newSchedule = event.schedule.map((item: ScheduleForm) => {
        if (item.id === id) {
          return {
            ...item,
            [key]: e.target.value,
          };
        }
        return item;
      });
      setEvent((prev: EventForm) => ({
        ...prev,
        schedule: newSchedule,
      }));
    };

  const handleSwitchSchedule = (id: string) => {
    const newSchedule = event.schedule.map((item: ScheduleForm) => {
      if (item.id === id) {
        return {
          ...item,
          type: item.type === "normal" ? "unique" : "normal",
        };
      }
      return item;
    });
    setEvent((prev: EventForm) => ({
      ...prev,
      schedule: newSchedule,
    }));
  };

  const handleMetadataSwitchSchedule = (e: ChangeEvent<HTMLInputElement>) => {
    setMetadataObligatory(e.target.checked);
  };

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEvent((prev: EventForm) => ({
      ...prev,
      info: {
        ...prev.info,
        isExternal: e.target.checked,
        externalUrl: !e.target.checked ? "" : prev.info.externalUrl,
      },
    }));
  };

  const handleInfoChange =
    (key: keyof Info) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEvent((prev: EventForm) => ({
        ...prev,
        info: {
          ...prev.info,
          [key]: e.target.value,
        },
      }));
    };

  const handleAddMetadata = () => {
    if (metadataLabel) {
      const newMetadata = {
        name: metadataLabel.toLowerCase().replace(/\s+/g, ""),
        label: metadataLabel,
        type: metadataType,
        options:
          metadataType === "select"
            ? metadataOptions.split(",").map((opt) => opt.trim())
            : [],
        obligatory: metadataObligatory,
      };
      setEvent((prev: EventForm) => ({
        ...prev,
        operations: {
          ...prev.operations,
          requiredMetadata: prev.operations.requiredMetadata
            ? [...prev.operations.requiredMetadata, newMetadata]
            : [newMetadata],
        },
      }));
      setMetadataLabel("");
      setMetadataType("text");
      setMetadataOptions("");
      setMetadataObligatory(false);
    }
  };

  const handleDeleteMetadata = (name: string) => {
    setEvent((prev: EventForm) => ({
      ...prev,

      operations: {
        ...prev.operations,
        requiredMetadata: prev.operations.requiredMetadata
          ? prev.operations.requiredMetadata.filter(
              (item) => item.name !== name
            )
          : [],
      },
    }));
  };

  return (
    <form className={classes.column}>
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={event.info.isExternal}
              onChange={handleSwitchChange}
            />
          }
          label="Es un evento externo?"
        />
      </FormGroup>
      {event.info.isExternal ? (
        <div className={classes.row}>
          <p>1. Url externo</p>
          <TextField
            value={event.info.externalUrl}
            onChange={handleInfoChange("externalUrl")}
            fullWidth
          />
        </div>
      ) : (
        <>
          {event.info.isConcurrent && <EventWeekSchedule />}
          <div className={classes.row}>
            <p>
              1. Agrega y modifica tus entradas para el evento. Puedes agregar
              entradas con diferentes precios y cantidades. Una vez guardadas,
              las entradas se ordenaran automaticamente por precio.
            </p>
            {event.schedule.map((_, index) => (
              <ScheduleCard
                key={index}
                schedule={event.schedule[index] as ScheduleForm}
                handleDeleteSchedule={handleDeleteSchedule}
                handleChangeSchedule={handleChangeSchedule}
                handleSwitchSchedule={handleSwitchSchedule}
              />
            ))}
            <LoadingButton
              variant="contained"
              className={classes.button}
              onClick={handleAddSchedule}
            >
              Agregar Entrada
            </LoadingButton>
          </div>
          <div className={classes.row}>
            <p>
              2. Agrega información adicional requerida para los compradores del
              evento. Puedes agregar campos de tipo texto o selección.
            </p>
            <div className={classes.metadataForm}>
              <TextField
                label="Nombre de la información requerida"
                value={metadataLabel}
                onChange={(e) => setMetadataLabel(e.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={metadataType}
                  onChange={(e) => setMetadataType(e.target.value)}
                >
                  <MenuItem value="text">Texto</MenuItem>
                  <MenuItem value="select">Selección</MenuItem>
                  <MenuItem value="photo">Foto</MenuItem>
                </Select>
              </FormControl>
              {metadataType === "select" && (
                <TextField
                  label="Opciones (separadas por comas)"
                  value={metadataOptions}
                  onChange={(e) => setMetadataOptions(e.target.value)}
                  fullWidth
                />
              )}
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={metadataObligatory}
                      onChange={handleMetadataSwitchSchedule}
                    />
                  }
                  label="Es obligatorio?"
                />
              </FormGroup>
              <LoadingButton variant="contained" onClick={handleAddMetadata}>
                Agregar
              </LoadingButton>
            </div>
            {event.operations.requiredMetadata?.map((metadata, index) => (
              <div key={index} className={classes.metadataItem}>
                <p>
                  {metadata.label} ({metadata.type})
                </p>
                {metadata.type === "select" && (
                  <div className={classes.optionsChips}>
                    {metadata.options.map((option, optionIndex) => (
                      <Chip key={optionIndex} label={option} size="small" />
                    ))}
                  </div>
                )}
                {metadata.obligatory && <p> (Obligatorio)</p>}
                <IconButton
                  onClick={() => handleDeleteMetadata(metadata.name)}
                  className={classes.removeIcon}
                >
                  <RemoveCircleIcon color="error" />
                </IconButton>
              </div>
            ))}
          </div>
        </>
      )}
    </form>
  );
};

export default EventSchedule;
