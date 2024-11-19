import React from "react";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles<{ reverse: boolean }>()((theme, { reverse }) => ({
  root: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "12px 16px",
    fontWeight: "800",
    backgroundColor: "white",
    [theme.breakpoints.down("md")]: {
      padding: "12px 5px",
    },
  },
  container: {
    width: "100%",
    maxWidth: 983,
    [theme.breakpoints.down("md")]: {
      maxWidth: "100%",
    },
  },
  flexContainer: {
    display: "flex",
    gap: "5px",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      gap: 0,
    },
  },
  textContainer: {
    width: "54%",
    marginLeft: 5,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",

    alignItems: !reverse ? "start" : "end",
    [theme.breakpoints.down("md")]: {
      marginLeft: 0,
      width: "100%",
    },
  },
  subtitle: {
    fontSize: "1.5rem",
    color: !reverse ? theme.palette.primary.main : theme.palette.secondary.main,
    [theme.breakpoints.down("md")]: {
      fontSize: "1.25rem",
    },
  },
  imageContainer: {
    width: "50%",
    marginLeft: "5px",
    [theme.breakpoints.down("md")]: {
      marginLeft: 0,
      width: "100%",
    },
  },
  image: {
    width: "100%",
    objectFit: "cover",
    aspectRatio: 1.49,
    [theme.breakpoints.down("md")]: {
      marginTop: "10px",
    },
  },
  title: {
    color: "black",
    alignText: !reverse ? "start" : "end",
  },
}));

export default function Info({
  subtitle,
  title,
  image,
  reverse = false,
}: {
  subtitle: string;
  title: string;
  image: string;
  reverse?: boolean;
}) {
  const { classes } = useStyles({ reverse });

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {reverse ? (
          <div className={classes.flexContainer}>
            <div className={classes.imageContainer}>
              <img loading="lazy" src={image} className={classes.image} />
            </div>
            <div className={classes.textContainer}>
              <div className={classes.subtitle}>{subtitle}</div>
              <div className={classes.title}>{title}</div>
            </div>
          </div>
        ) : (
          <div className={classes.flexContainer}>
            <div className={classes.textContainer}>
              <div className={classes.subtitle}>{subtitle}</div>
              <div className={classes.title}>{title}</div>
            </div>
            <div className={classes.imageContainer}>
              <img loading="lazy" src={image} className={classes.image} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
