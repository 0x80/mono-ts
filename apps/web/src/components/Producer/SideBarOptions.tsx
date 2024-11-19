import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import StadiumIcon from "@mui/icons-material/Stadium";
import { useRouter } from "next/router";
import { makeStyles } from "tss-react/mui";
import HomeIcon from "@mui/icons-material/Home";
import { Collapse } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useProducerContext } from "@/context/ProducerContext";
import TuneIcon from "@mui/icons-material/Tune";
import CelebrationIcon from "@mui/icons-material/Celebration";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const useStyles = makeStyles()((_) => ({
  text: { color: "white", fontSize: 600 },
  icon: { color: "white" },
}));

export default function ProducerSideBarOptions() {
  const { classes } = useStyles();
  const router = useRouter();
  const [openSection, setOpenSection] = useState("");
  const { producerId } = useProducerContext();

  const handleSectionToggle = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  return (
    <div>
      <List>
        <ListItem
          key={"Inicio"}
          disablePadding
          onClick={() => void router.push("/producers")}
        >
          <ListItemButton>
            <ListItemIcon className={classes.icon}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{
                fontWeight: "700",
              }}
              className={classes.text}
              primary={"Inicio"}
            />
          </ListItemButton>
        </ListItem>

        <ListItemButton onClick={() => handleSectionToggle("events")}>
          <ListItemIcon className={classes.icon}>
            <CelebrationIcon />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontWeight: "700",
            }}
            className={classes.text}
            primary={"Eventos"}
          />
          {openSection === "events" ? (
            <ExpandLess className={classes.icon} />
          ) : (
            <ExpandMore className={classes.icon} />
          )}
        </ListItemButton>
        <Collapse in={openSection === "events"} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              key={"Mis eventos"}
              disablePadding
              onClick={() => void router.push("/producers/events")}
            >
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon className={classes.icon}>
                  <StadiumIcon />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontWeight: "600",
                  }}
                  className={classes.text}
                  primary={"Mis eventos"}
                />
              </ListItemButton>
            </ListItem>
            <ListItem
              key={"Nuevo evento"}
              disablePadding
              onClick={() => void router.push("/events/create")}
            >
              <ListItemButton sx={{ pl: 4 }}>
                <ListItemIcon className={classes.icon}>
                  <AddCircleOutlineIcon />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontWeight: "600",
                  }}
                  className={classes.text}
                  primary={"Nuevo evento"}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Collapse>

        <ListItemButton onClick={() => handleSectionToggle("settings")}>
          <ListItemIcon className={classes.icon}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              fontWeight: "700",
            }}
            className={classes.text}
            primary={"Configuración"}
          />
          {openSection === "settings" ? (
            <ExpandLess className={classes.icon} />
          ) : (
            <ExpandMore className={classes.icon} />
          )}
        </ListItemButton>
        <Collapse in={openSection === "settings"} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() => void router.push(`/producers/${producerId}/edit`)}
            >
              <ListItemIcon className={classes.icon}>
                <TuneIcon />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  fontWeight: "600",
                }}
                className={classes.text}
                primary={"Editar productora"}
              />
            </ListItemButton>
            <ListItemButton
              sx={{ pl: 4 }}
              onClick={() =>
                void router.push(`/producers/${producerId}/access`)
              }
            >
              <ListItemIcon className={classes.icon}>
                <ManageAccountsIcon />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{
                  fontWeight: "600",
                }}
                className={classes.text}
                primary={"Gestionar accesos"}
              />
            </ListItemButton>
          </List>
        </Collapse>
      </List>
    </div>
  );
}
