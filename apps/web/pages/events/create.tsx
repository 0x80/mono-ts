import WithAuth from "@/components/Auth/WithAuth";
import EventStepper from "@/components/Event/Stepper/Stepper";
import { StepperContextProvider } from "@/context/StepperContext";
import React from "react";

export default function EventCreate() {
  return (
    <WithAuth admin producer>
      <StepperContextProvider>
        <EventStepper />
      </StepperContextProvider>
    </WithAuth>
  );
}
