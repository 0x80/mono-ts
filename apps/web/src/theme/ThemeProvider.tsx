import React from "react";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import customTheme from "./theme";

type ThemeProviderProps = {
  children: React.ReactNode;
};

/* declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
} */

export const ToggleThemeContext = React.createContext({
  toggleTheme: () => {
    console.log();
  },
  isDark: false,
});

export const ThemeProvider2: React.FC<ThemeProviderProps> = ({
  children,
}: ThemeProviderProps) => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={customTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default ThemeProvider2;
