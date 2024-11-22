import React, { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useStepperContext } from "@/context/StepperContext";
import GoogleMaps from "@/services/googleMaps/AddressSearch";
import type { EventForm, Location } from "@/firebase/interfaces/events";
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
    gap: "16px",
  },
}));

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS;

const EventLocation = () => {
  const { event, setEvent } = useStepperContext();

  const { classes } = useStyles();
  const [inputValue, setInputValue] = useState(event.location.name || "");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    setEvent((prev: EventForm) => ({
      ...prev,
      location: {
        ...prev.location,
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        address: inputValue,
      },
    }));
  }, [inputValue, location, setEvent]);

  const handleChange =
    (key: keyof Location) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEvent((prev: EventForm) => ({
        ...prev,
        location: {
          ...prev.location,
          [key]: e.target.value,
        },
      }));
    };
  return (
    <form className={classes.column}>
      <div className={classes.row}>
        <p>1. Nombre del lugar</p>
        <TextField
          value={event.location.name}
          onChange={handleChange("name")}
          fullWidth
        />
      </div>

      <div className={classes.row}>
        <p>2. Dirección del lugar</p>
        <GoogleMaps
          inputValue={inputValue}
          setInputValue={setInputValue}
          location={location}
          setLocation={setLocation}
        />
        {location && (
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${event.location.address}`}
            width="600"
            height="450"
            style={{ border: 0 }}
            aria-hidden="false"
          />
        )}
      </div>
    </form>
  );
};

export default EventLocation;
