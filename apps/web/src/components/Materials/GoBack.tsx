import React from "react";
import { makeStyles } from "tss-react/mui";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useRouter } from "next/router";
const useStyles = makeStyles()((_) => ({
  flex: {
    display: "flex",
    justifyContent: "start",
    alignItems: "center",
    flexDirection: "row",
    margin: "32px 0px",
    color: "#686869",
    cursor: "pointer",
  },
  icon: {
    fontSize: "16px",
    marginRight: "4px",
  },
  paragraph: {
    fontSize: "16px",
    fontWeight: 300,
    textDecoration: "underline",
  },
}));

export default function GoBack({
  text,
  route,
}: {
  text: string;
  route: string;
}) {
  const { classes } = useStyles();
  const router = useRouter();

  return (
    <div
      className={classes.flex}
      onClick={() => {
        router.push(route);
      }}
    >
      <ArrowBackIosIcon className={classes.icon} />
      <p className={classes.paragraph}>{text}</p>
    </div>
  );
}
