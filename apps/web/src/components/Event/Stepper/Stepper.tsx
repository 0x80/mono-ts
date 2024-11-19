import React, { Fragment, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import EventInfo from "./EventInfo";
import { makeStyles } from "tss-react/mui";
import EventLocation from "./EventLocation";
import EventFinance from "./EventFinance";
import EventSchedule from "./EventSchedule";
import { useStepperContext } from "@/context/StepperContext";
import { createEventFunction } from "@/firebase/functions/events/createEvent";
import LoadingButton from "@/components/Materials/LoadingButton";
import { useRouter } from "next/router";
import { formatDateWithOffset } from "@/utils/formatDateWithOffset";
import { updateEventFunction } from "@/firebase/functions/events/updateEvent";
import EventResell from "./EventResell";
import { useAuthContext } from "@/context/AuthContext";
import { useProducerContext } from "@/context/ProducerContext";
import type { EventForm } from "@/firebase/interfaces/events";
import EventProducerStep from "./EventProducer";

const useStyles = makeStyles()(() => ({
  step: {
    marginTop: "32px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
    },
  },
  button: {
    width: "200px",
  },
  marginButton: {
    marginRight: "16px",
    width: "200px",
  },
}));

const adminSteps = (isExternal: boolean) => {
  if (isExternal) {
    return ["Información del evento", "Entradas", "Ubicación", "Productora"];
  }
  return [
    "Información del evento",
    "Entradas",
    "Ubicación",
    "Productora",
    "Finanzas",
    "Reventa",
  ];
};

const steps = ["Información del evento", "Entradas", "Ubicación"];

const adminStepsHandler = (isExternal: boolean) => {
  const stepHandler = (activeStep: number) => {
    if (isExternal) {
      switch (activeStep) {
        case 0:
          return <EventInfo />;
        case 1:
          return <EventSchedule />;
        case 2:
          return <EventLocation />;
        case 3:
          return <EventProducerStep />;
        default:
          return <></>;
      }
    } else {
      switch (activeStep) {
        case 0:
          return <EventInfo />;
        case 1:
          return <EventSchedule />;
        case 2:
          return <EventLocation />;
        case 3:
          return <EventProducerStep />;
        case 4:
          return <EventFinance />;
        case 5:
          return <EventResell />;
        default:
          return <></>;
      }
    }
  };

  stepHandler.displayName = "AdminStepHandler";
  return stepHandler;
};

const stepsHandler = (activeStep: number) => {
  switch (activeStep) {
    case 0:
      return <EventInfo />;
    case 1:
      return <EventSchedule />;
    case 2:
      return <EventLocation />;
    default:
      return <></>;
  }
};
export default function EventStepper({
  edit = false,
  eventEdit,
  eventId = "",
}: {
  edit?: boolean;
  eventEdit?: EventForm;
  eventId?: string;
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set<number>());
  const { classes } = useStyles();
  const { event, setEvent } = useStepperContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { isAdmin, isProducer } = useAuthContext();
  const { producer, producerId } = useProducerContext();
  const [stepsTitles, setStepsTitles] = useState(steps);
  const [stepFunction, setStepFunction] = useState<
    (activeStep: number) => JSX.Element
  >(() => stepsHandler);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      setStepsTitles(adminSteps(event.info.isExternal));
      setStepFunction(() => adminStepsHandler(event.info.isExternal));
      setLoading(false);
    } else {
      setStepsTitles(steps);
      setStepFunction(() => stepsHandler);
      setLoading(false);
    }
  }, [isAdmin, event.info.isExternal]);

  useEffect(() => {
    if (edit && eventEdit) {
      setEvent(eventEdit);
    }
  }, [edit, eventEdit, setEvent]);

  const handleNext = () => {
    const newSkipped = skipped;

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleSubmit = async (redirect = true) => {
    setIsSubmitting(true);
    await fetch(event.info.image);
    const reader = new FileReader();
    const response = await fetch(event.info.image);
    const blob = await response.blob();
    reader.onloadend = async () => {
      const base64Image = reader.result?.toString().split(",")[1];

      if (base64Image) {
        try {
          const eventData = {
            ...event,
            info: {
              ...event.info,
              image: base64Image,
              description: event.info.description.replace(/\r?\n|\r/g, "!&!"),
              start: formatDateWithOffset(
                event.info.start == "" ? new Date() : new Date(event.info.start)
              ),
              end: formatDateWithOffset(
                event.info.end == "" ? new Date() : new Date(event.info.end)
              ),
            },
            producer: isProducer
              ? {
                  id: producerId,
                  image: producer.image,
                  name: producer.name,
                  ratings: producer.ratings,
                }
              : event.producer,
            resell: {
              ...event.resell,
              resellQueueNumber: event.resell.resellQueueNumber ?? 0,
            },
          };
          if (edit) {
            await updateEventFunction({
              eventId: eventId,
              eventData: eventData,
            });
          } else {
            await createEventFunction(eventData);
          }
          if (redirect) {
            if (isAdmin) {
              router.push("/admin/events");
            } else {
              router.push("/producers/events");
            }
          }
          setIsSubmitting(false);
        } catch {
          setIsSubmitting(false);
        }
      } else {
        setIsSubmitting(false);
      }
    };
    reader.readAsDataURL(blob);
  };

  return (
    <Box sx={{ width: "100%", marginBottom: "64px", padding: "0px 32px" }}>
      {!loading && (
        <>
          <Stepper activeStep={activeStep}>
            {stepsTitles.map((label, _) => {
              const stepProps: { completed?: boolean } = {};

              return (
                <Step key={label} {...stepProps}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
          {activeStep === stepsTitles.length ? (
            <Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </Fragment>
          ) : (
            <Fragment>
              <div className={classes.step}>{stepFunction(activeStep)}</div>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Button
                  color="inherit"
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  Atrás
                </Button>
                <Box sx={{ flex: "1 1 auto" }} />
                {activeStep != stepsTitles.length - 1 &&
                  router.pathname !== "/events/create" && (
                    <div className={classes.marginButton}>
                      <LoadingButton
                        variant="contained"
                        color="secondary"
                        onClick={() => void handleSubmit(false)}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        Guardar
                      </LoadingButton>
                    </div>
                  )}
                {activeStep === stepsTitles.length - 1 ? (
                  <div className={classes.button}>
                    <LoadingButton
                      variant="contained"
                      color="secondary"
                      onClick={() => void handleSubmit(true)}
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Guardar y Terminar
                    </LoadingButton>
                  </div>
                ) : (
                  <div className={classes.button}>
                    <LoadingButton variant="contained" onClick={handleNext}>
                      Siguiente
                    </LoadingButton>
                  </div>
                )}
              </Box>
            </Fragment>
          )}
        </>
      )}
    </Box>
  );
}
