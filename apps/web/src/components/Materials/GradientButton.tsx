import React from "react";
import type { ButtonProps } from "@mui/material/Button";
import LoadingButton from "./LoadingButton";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  primary: {
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
    color: "#fff",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    "&.Mui-disabled": {
      background: "#cfcfcf",
      color: "#b8b8b8",
    },
    maxWidth: "200px",
  },
  secondary: {
    background: `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
    color: "#fff",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
    "&.Mui-disabled": {
      background: "#cfcfcf",
      color: "#b8b8b8",
    },
    maxWidth: "200px",
  },
  info: {
    background: `linear-gradient(135deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
    color: "#fff",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
    },
    "&.Mui-disabled": {
      background: "#cfcfcf",
      color: "#b8b8b8",
    },
    maxWidth: "200px",
  },
  error: {
    background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
    color: "#fff",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
    },
    "&.Mui-disabled": {
      background: "#cfcfcf",
      color: "#b8b8b8",
    },
    maxWidth: "200px",
  },
  warning: {
    background: `linear-gradient(135deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
    color: "#fff",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    "&:hover": {
      background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
    },
    "&.Mui-disabled": {
      background: "#cfcfcf",
      color: "#b8b8b8",
    },
    maxWidth: "200px",
  },
}));

const GradientButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  color = "primary",
  ...other
}) => {
  const { classes } = useStyles();
  const selectClass = (styleColor: string): string => {
    switch (styleColor) {
      case "primary":
        return classes.primary;
      case "secondary":
        return classes.secondary;
      case "info":
        return classes.info;
      case "error":
        return classes.error;
      case "warning":
        return classes.warning;
      default:
        return classes.primary;
    }
  };
  return (
    <LoadingButton
      {...other}
      loading={loading}
      className={selectClass(color) || ""}
    >
      {children}
    </LoadingButton>
  );
};

type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
};

export default GradientButton;
