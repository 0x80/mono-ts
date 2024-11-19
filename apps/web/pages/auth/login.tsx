import LoadingButton from "@/components/Materials/LoadingButton";
import { useAuthContext } from "@/context/AuthContext";
import { signIn, signInWithGoogle } from "@/firebase/auth/signIn";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  TextField,
  Alert,
  Button,
  Divider,
} from "@mui/material";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { makeStyles } from "tss-react/mui";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";

const useStyles = makeStyles()(() => ({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    justifyItems: "center",
    gap: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
    borderRadius: "16px",
    justifyItems: "center",
    padding: "24px",
    gap: "16px",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "20px",
  },
  divider: {
    width: "100%",
    margin: "16px 0",
  },
}));

export default function LogIn() {
  const { classes } = useStyles();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthContext();
  const router = useRouter();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await signIn(loginForm.email, loginForm.password);
      setUser(user);
      const idTokenResult = await user?.getIdTokenResult();
      if (user && idTokenResult?.claims.role === "admin") {
        router.push("/admin");
      } else if (user && idTokenResult?.claims.role === "producer") {
        router.push("/producers");
      } else {
        setError("Credenciales inválidas. Por favor, inténtalo de nuevo.");
      }
    } catch {
      setError("Credenciales inválidas. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      const idTokenResult = await user?.getIdTokenResult();
      if (user && idTokenResult?.claims.role === "admin") {
        router.push("/admin");
      } else if (user && idTokenResult?.claims.role === "producer") {
        router.push("/producers");
      } else {
        setError("Cuenta no autorizada. Por favor, contacta al administrador.");
      }
    } catch {
      setError(
        "Error al iniciar sesión con Google. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  return (
    <div className={classes.column}>
      <div className={classes.form}>
        <h1 className={classes.title}>Bienvenido de vuelta 👋</h1>
        <h4>Inicia sesión con tu cuenta de organizador</h4>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Correo electrónico"
          value={loginForm.email}
          onChange={(e) =>
            setLoginForm({ ...loginForm, email: e.target.value })
          }
          fullWidth
        />

        <FormControl sx={{ m: 1, width: "100%" }}>
          <InputLabel htmlFor="outlined-adornment-password">
            Contraseña
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            onChange={(e) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>
        <LoadingButton
          variant="contained"
          color="secondary"
          onClick={() => {
            handleLogin();
          }}
          loading={isLoading}
        >
          Iniciar Sesión
        </LoadingButton>
        <Divider className={classes.divider}>O</Divider>
        <Button
          variant="outlined"
          startIcon={<GoogleIcon />}
          onClick={() => {
            handleGoogleLogin();
          }}
          fullWidth
        >
          Iniciar sesión con Google
        </Button>
      </div>
    </div>
  );
}
