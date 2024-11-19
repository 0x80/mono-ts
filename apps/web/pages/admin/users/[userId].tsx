import React, { useEffect, useState } from "react";
import WithAuth from "@/components/Auth/WithAuth";
import { makeStyles } from "tss-react/mui";
import type { User } from "@/firebase/interfaces/users";
import { streamUser } from "@/firebase/db/users";
import { useRouter } from "next/router";
import LoadingButton from "@/components/Materials/LoadingButton";
import { changeUserRoleFunction } from "@/firebase/functions/users/changeUserRole";

const useStyles = makeStyles()(() => ({
  button: {
    width: "300px",
    marginTop: "40px",
  },
}));

export default function AminUser() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const userId = router.query.userId as string;
  const [isLoading, setIsLoading] = useState(false);
  const { classes } = useStyles();

  useEffect(() => {
    const unsubscribe = streamUser(
      userId,
      (snapshot) => {
        setUser(snapshot.data() as User);
      },
      () => {
        return;
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const handleAdmin = async () => {
    setIsLoading(true);
    await changeUserRoleFunction({
      uid: userId,
      role: user?.role === "admin" ? "user" : "admin",
    });
    setIsLoading(false);
  };

  return (
    <WithAuth admin>
      {user && (
        <div>
          <h1>
            Nombre: {user.firstName} {user.lastName}
          </h1>
          <p>Email: {user.email}</p>
          <p>Dni: {user.dni}</p>
          <p>Tipo de Dni: {user.dniType}</p>
          <p>País: {user.country}</p>
          <p>Rol: {user.role}</p>
          <div className={classes.button}>
            <LoadingButton
              variant="contained"
              onClick={() => {
                handleAdmin();
              }}
              loading={isLoading}
            >
              {user.role === "admin" ? "Quitar Admin" : "Hacer Admin"}
            </LoadingButton>
          </div>
        </div>
      )}
    </WithAuth>
  );
}
