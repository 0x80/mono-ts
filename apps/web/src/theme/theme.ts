import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { Poppins } from "next/font/google";

const openSans = Poppins({
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#60A5FA", // Original
      light: "#AECBFA", // Light variant
      dark: "#1E73E8", // Dark variant
    },
    secondary: {
      main: "#34D399", // Original
      light: "#7BE7C0", // Light variant
      dark: "#119F73", // Dark variant
    },
    info: {
      main: "#094CA3", // Original
      light: "#5A88D0", // Light variant
      dark: "#05357A", // Dark variant
    },
    error: {
      main: red.A400, // Original
      light: red.A200, // Light variant (from Material-UI's red palette)
      dark: red.A700, // Dark variant (from Material-UI's red palette)
    },
  },
  typography: {
    fontFamily: openSans.style.fontFamily,
    fontWeightMedium: 900,
  },
});

export default theme;
