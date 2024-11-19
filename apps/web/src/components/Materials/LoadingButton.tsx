import React from "react";
import { styled } from "@mui/system";
import Button, { type ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const StyledButton = styled(Button)(() => ({
  color: "white",
}));

const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  children,
  ...other
}) => {
  if (loading) {
    return (
      <StyledButton {...other} disabled fullWidth>
        <CircularProgress size={24} />
      </StyledButton>
    );
  } else {
    return (
      <StyledButton {...other} fullWidth>
        {children}
      </StyledButton>
    );
  }
};

type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
};

export default LoadingButton;
