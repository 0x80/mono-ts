import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

export default function LoadingComponent() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        height: "calc(100vh - 80px)",
        width: "100%",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
