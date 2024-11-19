import React from "react";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useRouter } from "next/router";
import { useAuthContext } from "@/context/AuthContext";
import { signOutHandler } from "@/firebase/auth/signOut";
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { useProducerContext } from "@/context/ProducerContext";

const useStyles = makeStyles()(() => ({
  text: { color: "white" },
  icon: { color: "white" },
}));
export default function SignOutButton() {
  const router = useRouter();
  const { classes } = useStyles();
  const { setUser } = useAuthContext();
  const { setProducerId } = useProducerContext();

  const signOut = async () => {
    setProducerId("");
    setUser(null);
    localStorage.clear();
    await signOutHandler();
    router.push("/");
  };

  return (
    <ListItem
      key={"Cerrar sesión"}
      disablePadding
      onClick={() => {
        signOut();
      }}
    >
      <ListItemButton>
        <ListItemIcon className={classes.icon}>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{
            fontWeight: "700",
          }}
          className={classes.text}
          primary={"Cerrar sesión"}
        />
      </ListItemButton>
    </ListItem>
  );
}
