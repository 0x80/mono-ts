import React, { useState } from "react";
import { makeStyles } from "tss-react/mui";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { type StepIconProps, styled } from "@mui/material";
import GradientButton from "@/components/Materials/GradientButton";
import CostSimulatorPaymentMethods from "@/components/CostSimulator/PaymenMethods";
import CostSimulatorShowCost from "@/components/CostSimulator/ShowCost";
import CostSimulatorSchedule from "@/components/CostSimulator/Schedule";
import { useCostContext } from "@/context/CostSimulatorContext";

const steps = [
  {
    label:
      "Selecciona los métodos de pago que quieres que estén disponibles para tu evento",
  },
  {
    label: "Agrega información sobre las entradas que quieres vender",
  },
  {
    label: "Create an ad",
  },
];

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme }) => ({
  backgroundColor: "#ccc",
  zIndex: 1,
  color: "#fff",
  height: "28px",
  width: "28px",
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...theme.applyStyles("dark", {
    backgroundColor: theme.palette.grey[700],
  }),
  variants: [
    {
      props: ({ ownerState }) => ownerState.active,
      style: {
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
      },
    },
    {
      props: ({ ownerState }) => ownerState.completed,
      style: {
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
      },
    },
  ],
}));

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      {props.icon}
    </ColorlibStepIconRoot>
  );
}
const useStyles = makeStyles()(() => ({
  flexBox: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "start",
    gap: "32px",
  },
}));

const stepSelector = (step: number) => {
  switch (step) {
    case 0:
      return <CostSimulatorPaymentMethods />;
    case 1:
      return <CostSimulatorSchedule />;
    case 2:
      return <div>Step 2</div>;
    default:
      return <div>Step 0</div>;
  }
};

export default function CostSimulatorStepper() {
  const { classes } = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const { cost } = useCostContext();
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };
  return (
    <div className={classes.flexBox}>
      <Box sx={{ maxWidth: 400 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={ColorlibStepIcon}
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Last step</Typography>
                  ) : null
                }
              >
                {step.label}
              </StepLabel>
              <StepContent>
                {stepSelector(index)}
                <Box sx={{ mb: 2 }}>
                  <GradientButton
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={
                      !(cost.paymentMethods.card || cost.paymentMethods.bank)
                    }
                  >
                    {index === steps.length - 1 ? "Finish" : "Siguiente"}
                  </GradientButton>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Atrás
                  </Button>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Reset
            </Button>
          </Paper>
        )}
      </Box>
      <CostSimulatorShowCost />
    </div>
  );
}
