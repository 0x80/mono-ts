import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles<{ color: string }>()((theme, { color }) => {
  let backgroundColor: string;

  switch (color) {
    case "primary":
      backgroundColor = theme.palette.primary.main;
      break;
    case "secondary":
      backgroundColor = theme.palette.secondary.main;
      break;
    case "info":
      backgroundColor = theme.palette.info.main;
      break;
    case "error":
      backgroundColor = theme.palette.error.main;
      break;
    default:
      backgroundColor = "#60A5FA";
      break;
  }
  return {
    stat: {
      displax: "flex",
      boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      borderRadius: "8px",
      padding: "16px",
      backgroundColor: backgroundColor,
      color: "#FFFFFF",
    },
    statNumber: {
      fontSize: "28px",
    },
    statTitle: {
      fontSize: "14px",
    },
    expandedRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
  };
});

export default function DashboardCard({
  title,
  count,
  color,
  icon,
}: {
  title: string;
  count: number | string;
  color: string;
  icon: JSX.Element;
}) {
  const { classes } = useStyles({ color });

  return (
    <div className={classes.stat}>
      <div className={classes.expandedRow}>
        <h1 className={classes.statTitle}>{title}</h1>
        {icon}
      </div>
      <h1 className={classes.statNumber}>{count}</h1>
    </div>
  );
}
