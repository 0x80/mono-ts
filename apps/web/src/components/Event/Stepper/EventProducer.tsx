import React, { useEffect, useState } from "react";
import { MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useStepperContext } from "@/context/StepperContext";
import { getAllProducers } from "@/firebase/db/producers";
import type { EventForm, EventProducer } from "@/firebase/interfaces/events";

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

const EventProducerStep: React.FC = () => {
  const { event, setEvent } = useStepperContext();
  const [isLoading, setIsLoading] = useState(true);

  const { classes } = useStyles();

  const [producers, setProducers] = useState<
    Array<{
      id: string;
      name: string;
      image: string;
    }>
  >([]);

  useEffect(() => {
    getAllProducers().then((querySnapshot) => {
      const producers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        image: doc.data().image,
        domains: doc.data().domains ?? [],
        ratings: doc.data().ratings ?? {
          ratingPoint: 0,
          ratingTotal: 0,
          ratingNumber: 0,
        },
        earlyHash: doc.data().earlyHash ?? "",
      }));

      // Sort producers by name
      producers.sort((a, b) => a.name.localeCompare(b.name));

      setProducers(producers);
      if (event.producer.id && producers.length > 0) {
        const foundProducer = producers.find(
          (producer) => producer.id === event.producer.id
        );
        setEvent((prev: EventForm) => ({
          ...prev,
          producer: foundProducer ?? (producers[0] as EventProducer),
        }));
      }
    });
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: SelectChangeEvent<string>) => {
    const producer = JSON.parse(event.target.value as string);
    setEvent((prev: EventForm) => ({
      ...prev,
      producer: {
        id: producer.id,
        name: producer.name,
        image: producer.image,
        domains: producer.domains ?? [],
        ratings: producer.ratings ?? {
          ratingPoint: 0,
          ratingTotal: 0,
          ratingNumber: 0,
        },
        earlyHash: producer.earlyHash ?? "",
      },
    }));
  };

  return (
    <form className={classes.column}>
      <div className={classes.row}>
        <p>1. Selecciona la productora</p>
        {isLoading ? (
          <p>Cargando...</p>
        ) : (
          <Select
            onChange={handleChange}
            value={JSON.stringify(event.producer)}
          >
            {producers.map((producer) => (
              <MenuItem key={producer.id} value={JSON.stringify(producer)}>
                {producer.name}
              </MenuItem>
            ))}
          </Select>
        )}
      </div>
    </form>
  );
};

export default EventProducerStep;
