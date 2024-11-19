import { useAuthContext } from "@/context/AuthContext";
import { setEventStatusFunction } from "@/firebase/functions/events/setEventStatus";
import { useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { deleteEventFunction } from "@/firebase/functions/events/deleteEvent";
import { duplicateEventFunction } from "@/firebase/functions/events/duplicateEvent";
import GradientButton from "./GradientButton";
import { makeStyles } from "tss-react/mui";
import type { HttpsCallableResult } from "firebase/functions";

const useStyles = makeStyles()((theme) => ({
  dialog: {
    padding: "32px",
    borderRadius: "12px",
  },
  dialogTitle: {
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  select: {
    minWidth: "200px",
    background: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
  },
}));

const ChevronDownIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function DropdownMenu({
  eventId,
  eventStatus,
}: {
  eventId: string;
  eventStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const { isProducer, isAdmin } = useAuthContext();
  const { classes } = useStyles();
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const handleAsyncAction = async (
    action: () => Promise<HttpsCallableResult<void>>
  ) => {
    setLoading(true);
    await action();
    setLoading(false);
  };

  const setEventStatus = (status: string) =>
    handleAsyncAction(() => setEventStatusFunction({ eventId, status }));

  const deleteEvent = () =>
    handleAsyncAction(() => deleteEventFunction({ eventId }));

  const duplicateEvent = () =>
    handleAsyncAction(() => duplicateEventFunction({ eventId }));

  const handleOpen = () => {
    setNewStatus(eventStatus);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleChangeStatus = () => {
    handleAsyncAction(
      async () => await setEventStatusFunction({ status: newStatus, eventId })
    );
    handleClose();
  };

  return (
    <div className="group relative">
      <ChevronDownIcon className="ml-2 h-4 w-4" />
      <div className="absolute left-0 z-10 hidden w-56 space-y-1 bg-white py-2 shadow-md group-hover:block">
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              height: "100px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            {isAdmin && (
              <>
                <div
                  onClick={handleOpen}
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Cambiar estado
                </div>
                <Dialog open={open} onClose={handleClose}>
                  <DialogTitle className={classes.dialogTitle}>
                    Cambiar estado del evento
                  </DialogTitle>
                  <DialogContent className={classes.dialog}>
                    <FormControl
                      fullWidth
                      variant="outlined"
                      className={classes.select}
                    >
                      <InputLabel>Estado</InputLabel>
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        label="Estado"
                      >
                        <MenuItem value="Draft">Borrador</MenuItem>
                        <MenuItem value="InReview">En Revisión</MenuItem>
                        <MenuItem value="Active">Activo</MenuItem>
                        <MenuItem value="Private">Privado</MenuItem>
                        <MenuItem value="Visible">Visible</MenuItem>
                        <MenuItem value="External">Externo</MenuItem>
                        <MenuItem value="Expired">Expirado</MenuItem>
                        <MenuItem value="Rejected">Rechazado</MenuItem>
                      </Select>
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <GradientButton
                      onClick={handleClose}
                      color="secondary"
                      variant="outlined"
                    >
                      Cancelar
                    </GradientButton>
                    <GradientButton
                      onClick={handleChangeStatus}
                      color="primary"
                      variant="contained"
                      loading={loading}
                    >
                      Cambiar
                    </GradientButton>
                  </DialogActions>
                </Dialog>
              </>
            )}
            <div
              className="block px-4 py-2 text-sm hover:bg-gray-100"
              onClick={() => {
                void duplicateEvent();
                // Ensure no promise is returned to the onClick handler
              }}
            >
              Duplicar
            </div>
            {eventStatus === "Draft" && isProducer && (
              <div
                onClick={() => void setEventStatus("InReview")}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Mandar a revisión
              </div>
            )}
            {eventStatus === "InReview" && isProducer && (
              <div
                onClick={() => void setEventStatus("Draft")}
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Cancelar revisión
              </div>
            )}
            {eventStatus === "Draft" && (
              <div
                className="block px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => {
                  deleteEvent(); // Call deleteEvent without returning the promise
                }}
              >
                Borrar
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
