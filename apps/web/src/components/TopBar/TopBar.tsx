import React, { type ReactNode, useState } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, {
  type AppBarProps as MuiAppBarProps,
} from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import AdminSideBarOptions from "../Admin/SideBarOptions";
import { useAuthContext } from "@/context/AuthContext";
import SignOutButton from "../Auth/SignOutButton";
import { makeStyles } from "tss-react/mui";
import Image from "next/image";
import ProducerSideBarOptions from "../Producer/SideBarOptions";
import { useRouter } from "next/router";
import { useProducerContext } from "@/context/ProducerContext";
import {
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

const drawerWidth = 240;
const useStyles = makeStyles()(() => ({
  userName: {
    color: "black",
    fontSize: "1.1rem",
    fontWeight: "600",
  },
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

type AppBarProps = MuiAppBarProps & {
  open?: boolean;
};

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "center",
}));

export default function TopBar({ children }: { children: ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  const [open, setOpen] = useState(window.innerWidth > 600);
  const { classes } = useStyles();
  const { user, isAdmin, isProducer, userData } = useAuthContext();
  const { producer, producerId, setProducerId } = useProducerContext();

  const handleDrawerOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleProducerChange = (event: SelectChangeEvent) => {
    setProducerId(event.target.value as string);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{ backgroundColor: "white", height: "80px" }}
      >
        <Toolbar
          sx={{
            justifyContent: "space-between",
            height: "80px",
            marginRight: "16px",
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          {isProducer ? (
            <div>
              <FormControl fullWidth variant="standard">
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={producerId}
                  label={producer.name}
                  onChange={handleProducerChange}
                >
                  {userData?.producers?.map((producer) => (
                    <MenuItem value={producer.id} key={producer.id}>
                      {producer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          ) : (
            <div>
              {user && <h1 className={classes.userName}>{user.displayName}</h1>}
            </div>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: theme.palette.primary.main,
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <Image
            src="/early.png"
            alt="early"
            width={115}
            height={36}
            onClick={() => void router.push("https://byearly.com/")}
          ></Image>
        </DrawerHeader>
        <div />
        {user && isAdmin && <AdminSideBarOptions />}
        {user && isProducer && <ProducerSideBarOptions />}

        {user && (
          <>
            <Divider sx={{ bgcolor: "white" }} />
            <List>
              <SignOutButton></SignOutButton>
            </List>
          </>
        )}
      </Drawer>
      <Main open={open} sx={{ marginTop: "32px", padding: 0 }}>
        <DrawerHeader />
        {children}
      </Main>
    </Box>
  );
}
