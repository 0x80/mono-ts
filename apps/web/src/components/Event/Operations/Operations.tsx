import React, { useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuthContext } from "@/context/AuthContext";
import Validators from "@/components/Event/Operations/Validators";
import GenerateTicketForm from "@/components/Event/Operations/GenerateTicket";
import CourtoisieTicket from "@/components/Event/Operations/CourtoisieTicket";
import type { Event } from "@/firebase/interfaces/events";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { makeStyles } from "tss-react/mui";
import SendEventMessage from "./SendEventMessage";
import TicketSchedule from "./Schedule/TicketSchedule";
import RequiredMetadataOperations from "./RequiredMetadata/RequiredMetadata";
import BlockPaymentMethods from "./BlockPaymentMethods";

const useStyles = makeStyles()((theme) => ({
  tabsRoot: {
    ".MuiTab-root": {
      backgroundColor: "#ffffff", // Default background color for unselected tabs
      "&:hover": {
        backgroundColor: "#e0e0e0", // Hover color for unselected tabs
      },
    },
    ".Mui-selected": {
      backgroundColor: theme.palette.secondary.main, // Background color for selected tab
      color: "#ffffff", // Text color for selected tab
      "&:hover": {
        backgroundColor: theme.palette.secondary.main, // Background color for selected tab
      },
    },
    ".MuiTabs-indicator": { backgroundColor: "transparent" }, // Remove default underline indicator
  },
}));
type TabPanelProps = {
  children?: ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
      style={{ flexGrow: 1 }} // Ensure the TabPanel grows to take available space
    >
      {value === index && (
        <Box sx={{ padding: "0px 16px", width: "100%" }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    "aria-controls": `vertical-tabpanel-${index}`,
  };
}
const activatedStatus = ["Active", "Visible", "Private"];

export default function EventOperations({ event }: { event: Event }) {
  const router = useRouter();
  const eventId = router.query.eventId as string;
  const { isAdmin } = useAuthContext();
  const [value, setValue] = useState(0);
  const { classes } = useStyles();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <>
      {activatedStatus.includes(event.info.status) && (
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: "background.paper",
            display: "flex",
            height: 800,
            marginTop: "16px",
          }}
        >
          <Tabs
            orientation="vertical"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{ borderRight: 1, borderColor: "divider" }}
            className={classes.tabsRoot}
          >
            <Tab label="Cronograma de entradas" {...a11yProps(0)} />
            <Tab label="Información adicional" {...a11yProps(1)} />

            <Tab label="Generar ticket" {...a11yProps(2)} />
            <Tab label="Enviar comunicado" {...a11yProps(3)} />
            <Tab label="Añadir validadores" {...a11yProps(4)} />
            {isAdmin && (
              <Tab label="Generar ticket de cortesia" {...a11yProps(5)} />
            )}
            {isAdmin && (
              <Tab label="Bloquear métodos de pago" {...a11yProps(6)} />
            )}
          </Tabs>
          <TabPanel value={value} index={0}>
            <TicketSchedule
              event={{
                ...event,
                id: eventId,
              }}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <RequiredMetadataOperations
              event={{
                ...event,
                id: eventId,
              }}
            />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <GenerateTicketForm
              event={{
                ...event,
                id: eventId,
              }}
            />
          </TabPanel>
          <TabPanel value={value} index={3}>
            <SendEventMessage
              event={{
                ...event,
                id: eventId,
              }}
            />
          </TabPanel>

          <TabPanel value={value} index={4}>
            <Validators
              event={{
                ...event,
                id: eventId,
                operations: {
                  ...event.operations,
                  validatorsData: event.operations.validatorsData ?? [],
                },
              }}
            />
          </TabPanel>
          {isAdmin && (
            <TabPanel value={value} index={5}>
              <CourtoisieTicket
                event={{
                  ...event,
                  id: eventId,
                }}
              />
            </TabPanel>
          )}
          {isAdmin && (
            <TabPanel value={value} index={6}>
              <BlockPaymentMethods
                event={{
                  ...event,
                  id: eventId,
                }}
              />
            </TabPanel>
          )}
        </Box>
      )}
    </>
  );
}
