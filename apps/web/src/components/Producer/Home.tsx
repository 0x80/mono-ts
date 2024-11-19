import { useProducerContext } from "@/context/ProducerContext";
import { Grid } from "@mui/material";
import Image from "next/image";
import React from "react";
import { makeStyles } from "tss-react/mui";
import NoProducer from "./NoProducer";

const useStyles = makeStyles()(() => ({
  column: {
    margin: "32px",
  },
  image: {
    position: "relative",
    width: "320px",
    height: "180px",
    borderRadius: "8px",
    overflow: "hidden",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
  },
  subtitle: { fontSize: "16px" },
  card: {
    display: "flex",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    borderRadius: "8px",
    padding: "32px",
    backgroundColor: "white",
    color: "black",
    minHeight: "180px",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    alignItems: "center",
    gap: "16px",
  },
  circleImage: {
    width: "64px",
    height: "64px",
    minWidth: "64px",
    maxWidth: "64px",
    minHeight: "64px",
    maxHeight: "64px",
    borderRadius: "50%",
    backgroundColor: "black",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
}));

export default function ProducerHome() {
  const { classes } = useStyles();
  const { producer } = useProducerContext();

  if (producer.name == "") return <NoProducer />;
  return (
    <div className={classes.column}>
      <Grid container justifyContent="center" alignItems="center" gap={2}>
        <Grid xs={12} md={6}>
          <div className={classes.card}>
            <div className={classes.row}>
              <div className={classes.circleImage}>
                <Image
                  src={producer.image}
                  alt="background"
                  fill
                  objectFit="cover"
                ></Image>
              </div>
              <div>
                <h1 className={classes.title}>{producer.name} 👋</h1>
                <p className={classes.subtitle}>
                  Aquí puedes visualizar toda la información acerca de tu
                  negocio
                </p>
              </div>
            </div>
          </div>
        </Grid>
        <Grid xs={12} md={4}>
          <div className={classes.image}>
            <Image
              src={producer.backgroundImage}
              alt="background"
              fill
              objectFit="cover"
            ></Image>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}
