import * as React from "react";
import { styled } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";

const useStyles = makeStyles()(() => ({
  progressCount: {
    marginTop: "8px",
    fontSize: "12px", // Set the font size here
  },
  spanBold: {
    fontWeight: "bold",
    fontSize: "12px", // Set the font size here
  },
}));

const BorderLinearProgress = styled(LinearProgress, {
  shouldForwardProp: (prop) => prop !== "isFull",
})<{ isFull: boolean }>(({ theme, isFull }) => ({
  height: 10,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
    ...theme.applyStyles("dark", {
      backgroundColor: theme.palette.grey[800],
    }),
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: isFull
      ? theme.palette.secondary.dark
      : theme.palette.secondary.main, // Set to red when full
    ...theme.applyStyles("dark", {
      backgroundColor: isFull ? theme.palette.secondary.dark : "#308fe8", // Set to red in dark mode when full
    }),
  },
}));

export default function ProgressBar({
  ticketSelled,
  ticketTotal,
}: {
  ticketSelled: number;
  ticketTotal: number;
}) {
  const { classes } = useStyles();
  const isFull = ticketSelled === ticketTotal;
  return (
    <div>
      <BorderLinearProgress
        variant="determinate"
        value={(ticketSelled * 100) / ticketTotal}
        isFull={isFull} // Pass the isFull prop
      />
      <div className={classes.progressCount}>
        <span className={classes.spanBold}>{ticketSelled}</span> de{" "}
        <span className={classes.spanBold}>{ticketTotal}</span> vendidos
      </div>
    </div>
  );
}
