import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()(() => {
  return {
    stat: {
      displax: "flex",
      borderRadius: "8px",
      padding: "16px",
      backgroundColor: "#FFFFFF",
      color: "black",
      border: "1px solid #e0e0e0",
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

export default function SelledCard({
  title,
  count,
  icon,
}: {
  title: string;
  count: number | string;
  icon: JSX.Element;
}) {
  const { classes } = useStyles();

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
