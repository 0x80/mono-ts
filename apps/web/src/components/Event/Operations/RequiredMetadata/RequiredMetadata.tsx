import type {
  EventWithId,
  RequiredMetadata,
} from "@/firebase/interfaces/events";
import React from "react";
import { makeStyles } from "tss-react/mui";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";

import ModeEditOutlineRoundedIcon from "@mui/icons-material/ModeEditOutlineRounded";
import EditOffRoundedIcon from "@mui/icons-material/EditOffRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

import { RequiredMetadataAction } from "./RequiredMetadataAction";

const useStyles = makeStyles()((_) => ({
  scheduleCard: {
    borderRadius: "8px",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    minHeight: "80px",
    padding: "16px 24px",
    maxWidth: "800px",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "24px",
    border: "1px solid #E0E0E0",
    gap: "32px",
  },
  scheduleCardTitle: {
    display: "flex",
    flexDirection: "column",
  },
  scheduleCardRow: {
    display: "flex",
    flexDirection: "row",
    gap: "32px",
  },
  scheduleCardColumn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "50px",
    gap: "8px",
  },
  title: {
    fontSize: "16px",
    fontWeight: "bold",
  },
  titleCard: {
    fontSize: "12px",
    fontWeight: "normal",
    textAlign: "center",
  },
  subtitle: {
    fontSize: "12px",
    fontWeight: "normal",
    color: "#828282",
  },
  subtitleCard: {
    fontSize: "12px",
    fontWeight: "bold",
    textAlign: "center",
  },
  scheduleContainer: {
    marginBottom: "32px",
  },
}));

const typeTranslation = (type: string) => {
  switch (type) {
    case "photo":
      return "Foto";
    case "text":
      return "Texto";
    case "select":
      return "Selección";
    default:
      return "Normal";
  }
};

export default function RequiredMetadataOperations({
  event,
}: {
  event: EventWithId;
}) {
  const { classes } = useStyles();
  return (
    <div className={classes.scheduleContainer}>
      {event.operations.requiredMetadata.map(
        (metadataItem: RequiredMetadata) => (
          <div key={metadataItem.name} className={classes.scheduleCard}>
            <div className={classes.scheduleCardTitle}>
              <div className={classes.title}>{metadataItem.label}</div>
              <div className={classes.subtitle}>
                {metadataItem.options?.join(", ")}
              </div>
            </div>
            <div className={classes.scheduleCardRow}>
              <div className={classes.scheduleCardColumn}>
                <div className={classes.titleCard}>Tipo</div>
                <div className={classes.subtitleCard}>
                  {typeTranslation(metadataItem.type)}
                </div>
              </div>

              <div className={classes.scheduleCardColumn}>
                {(metadataItem.obligatory ?? true) ? (
                  <LockRoundedIcon color="error" />
                ) : (
                  <LockOpenRoundedIcon color="secondary" />
                )}
              </div>

              <div className={classes.scheduleCardColumn}>
                {(metadataItem.fillable ?? false) ? (
                  <ModeEditOutlineRoundedIcon color="secondary" />
                ) : (
                  <EditOffRoundedIcon color="error" />
                )}
              </div>
              <div className={classes.scheduleCardColumn}>
                <RequiredMetadataAction
                  metadataItem={metadataItem}
                  eventId={event.id}
                  type="edit"
                ></RequiredMetadataAction>
              </div>
              <div className={classes.scheduleCardColumn}>
                <RequiredMetadataAction
                  metadataItem={metadataItem}
                  eventId={event.id}
                  type="delete"
                ></RequiredMetadataAction>
              </div>
            </div>
          </div>
        )
      )}
      <RequiredMetadataAction
        metadataItem={{
          name: "",
          label: "",
          options: [],
          obligatory: true,
          type: "text",
          fillable: false,
        }}
        eventId={event.id}
        type="add"
      ></RequiredMetadataAction>
    </div>
  );
}
