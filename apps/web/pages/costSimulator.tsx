import WithAuth from "@/components/Auth/WithAuth";
import React from "react";
import { CostContextProvider } from "@/context/CostSimulatorContext";
import CostSimulatorStepper from "@/components/CostSimulator/Stepper";

export default function CostSimulatorPage() {
  return (
    <WithAuth producer admin>
      <CostContextProvider>
        <CostSimulatorStepper />
      </CostContextProvider>
    </WithAuth>
  );
}
