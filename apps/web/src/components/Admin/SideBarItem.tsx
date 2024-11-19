import React, { type ReactNode } from "react";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useRouter } from "next/router";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles<{ index: number; selectedIndex: number }>()(
  (theme, { index, selectedIndex }) => ({
    text: {
      color: "white",
      fontSize: 600,
    },
    icon: {
      color: "white",
    },
    listItem: {
      padding: "16px 0px",
      backgroundColor:
        selectedIndex === index
          ? theme.palette.primary.dark
          : theme.palette.primary.main,
    },
  })
);

export default function SideBarItem({
  text,
  icon,
  route,
  index,
  selectedIndex,
}: {
  text: string;
  icon: ReactNode;
  route: string;
  index: number;
  selectedIndex: number;
}) {
  const router = useRouter();
  const { classes } = useStyles({ index, selectedIndex });

  return (
    <ListItem
      key={text}
      disablePadding
      onClick={() => void router.push(route)}
      className={classes.listItem}
    >
      <ListItemButton>
        <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ fontWeight: "700" }}
          className={classes.text}
          primary={text}
        />
      </ListItemButton>
    </ListItem>
  );
}
