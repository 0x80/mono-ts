import React, { type ChangeEvent } from "react";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Select,
  type SelectChangeEvent,
  styled,
  Switch,
  TextField,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useStepperContext } from "@/context/StepperContext";
import Image from "next/image";
import LoadingButton from "@/components/Materials/LoadingButton";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import type { EventForm } from "@/firebase/interfaces/events";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
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
  image: {
    marginTop: "20px",
    width: "200px",
    height: "200px",
  },
  gridContainer: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "8px",
  },
}));

type Info = {
  description: string;
  end: Date | null;
  image: string;
  name: string;
  start: Date | null;
  activationDate: number | null;
  activityType: string;
  spotifyUrl?: string;
};

const tagDictionary: { [key: string]: string } = {
  concert: "Concierto",
  festival: "Festival",
  discotheque: "Discoteca",
  theater: "Teatro",
  sports: "Deportes",
  conference: "Conferencia",
  day: "Día",
  night: "Noche",
  party: "Fiesta",
  cultural: "Cultural",
  artistic: "Artístico",
  nature: "Naturaleza",
  educational: "Educativo",
  virtual: "Virtual",
  extreme: "Extremo",
  adventure: "Aventura",
  family: "Familiar",
  tour: "Tour",
  fashion: "Moda",
  gastronomy: "Gastronomía",
  music: "Música",
  dance: "Baile",
};

const EventInfo = () => {
  const { classes } = useStyles();
  const { event, setEvent } = useStepperContext();

  const handleChange =
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

  const handleSwitchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEvent((prev: EventForm) => ({
      ...prev,
      info: {
        ...prev.info,
        isConcurrent: e.target.checked,
        start: e.target.checked ? "" : prev.info.start,
        end: e.target.checked ? "" : prev.info.end,
      },
    }));
    if (!e.target.checked) {
      setEvent((prev: EventForm) => ({
        ...prev,
        weekSchedule: {
          sunday: {
            start: 0,
            end: 0,
            ticketTotal: 0,
            slotRange: 0,
          },
          monday: {
            start: 0,
            end: 0,
            ticketTotal: 0,
            slotRange: 0,
          },
          tuesday: {
            start: 0,
            end: 0,
            ticketTotal: 0,
            slotRange: 0,
          },
          wednesday: {
            start: 0,
            end: 0,
            ticketTotal: 0,
            slotRange: 0,
          },
          thursday: {
            start: 0,
            end: 0,
            ticketTotal: 0,
            slotRange: 0,
          },
          friday: {
            start: 0,
            end: 0,
            ticketTotal: 0,
            slotRange: 0,
          },
          saturday: {
            start: 0,
            end: 0,
            ticketTotal: 0,
            slotRange: 0,
          },
        },
      }));
    }
  };
  const handleFileChange =
    (prop: keyof typeof event.info) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEvent((prev: EventForm) => ({
            ...prev,
            info: {
              ...prev.info,
              [prop]: reader.result?.toString() || "",
            },
          }));
        };
        reader.readAsDataURL(file);
      }
    };

  const handleChangeSelect =
    (key: keyof Info) => (e: SelectChangeEvent<string>) => {
      setEvent((prev: EventForm) => ({
        ...prev,
        info: {
          ...prev.info,
          [key]: e.target.value,
        },
      }));
    };

  return (
    <form className={classes.column}>
      <div className={classes.row}>
        <p>1. Nombre del evento</p>
        <TextField
          value={event.info.name}
          onChange={handleChange("name")}
          fullWidth
        />
      </div>

      <div className={classes.row}>
        <p>2. Descripción del evento</p>
        <TextField
          multiline
          value={event.info.description}
          onChange={handleChange("description")}
          rows={16}
          fullWidth
        />
      </div>
      <div className={classes.row}>
        <p>3. Imagen del evento</p>

        <LoadingButton
          component="label"
          role={undefined}
          variant="contained"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          <VisuallyHiddenInput
            type="file"
            accept="image/*"
            onChange={() => {
              handleFileChange("image");
            }}
            maxLength={8 * 1024 * 1024}
          />
        </LoadingButton>
        {event.info.image && (
          <div>
            <Image
              src={event.info.image}
              alt="Uploaded file"
              className={classes.image}
              width={400}
              height={400}
            />
          </div>
        )}
      </div>
      <div className={classes.row}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={event.info.isConcurrent}
                onChange={handleSwitchChange}
              />
            }
            label="Tu evento es concurrente? (No tiene fecha de inicio ni de final, sino que sigue un horario"
          />
        </FormGroup>
      </div>
      {!event.info.isConcurrent && (
        <>
          <div className={classes.row}>
            <p>4. Fecha de inicio</p>
            <TextField
              id="datetime-local"
              type="datetime-local"
              sx={{ width: 250 }}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={handleChange("start")}
              value={event.info.start}
            />
          </div>

          <div className={classes.row}>
            <p>5. Fecha de término</p>
            <TextField
              type="datetime-local"
              sx={{ width: 250 }}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={handleChange("end")}
              value={event.info.end}
            />
          </div>
        </>
      )}

      <div className={classes.row}>
        <p>
          6. Cuantas horas antes del evento quieres que se activen las entradas
          (si no especificas nada sera a la hora del inicio del evento)
        </p>
        <TextField
          type="number"
          sx={{ width: 250 }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={handleChange("activationDate")}
          value={event.info.activationDate}
        />
      </div>
      <div className={classes.row}>
        <p>7. Selecciona la clasificación de tu evento</p>
        <Select
          value={event.info.activityType}
          onChange={handleChangeSelect("activityType")}
          fullWidth
        >
          <MenuItem value="activity">Actividad</MenuItem>
          <MenuItem value="cultureAndActivities">Cultura y Educacion</MenuItem>
          <MenuItem value="techno">Electronica</MenuItem>
          <MenuItem value="dancing">Bailable</MenuItem>
        </Select>
      </div>

      <div className={classes.row}>
        <p>
          8. Selecciona las casillas que correspondan a las categorias de tu
          evento
        </p>
        <div className={classes.gridContainer}>
          {Object.keys(tagDictionary).map((tag) => (
            <div key={tag}>
              <Checkbox
                checked={event.info.tags.includes(tag)}
                onChange={() => {
                  setEvent({
                    ...event,
                    info: {
                      ...event.info,
                      tags: event.info.tags.includes(tag)
                        ? event.info.tags.filter((t: string) => t !== tag)
                        : [...event.info.tags, tag],
                    },
                  });
                }}
              />
              {tagDictionary[tag]}
            </div>
          ))}
        </div>
      </div>
      <div className={classes.row}>
        <p>9. Link a spotify (Dejar en blanco si no corresponde)</p>
        <TextField
          type="text"
          sx={{ width: 250 }}
          onWheel={(e) => (e.target as HTMLElement).blur()}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={handleChange("spotifyUrl")}
          value={event.info.spotifyUrl}
        />
      </div>
    </form>
  );
};

export default EventInfo;
