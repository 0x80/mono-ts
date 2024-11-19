import React, { useEffect, useState } from "react";
import { makeStyles } from "tss-react/mui";
import AlgoliaTable from "@/components/Materials/Table";
import { TableCell, TableRow, TextField } from "@mui/material";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import LoadingButton from "@/components/Materials/LoadingButton";
import { useProducerContext } from "@/context/ProducerContext";
import { streamProducer } from "@/firebase/db/producers";
import Unauthorized from "@/components/Auth/Unauthorized";
import { useAuthContext } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { addProducerToUserFunction } from "@/firebase/functions/users/addProducer";
import type { Producer } from "@/firebase/interfaces/producers";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import GoBack from "@/components/Materials/GoBack";

const useStyles = makeStyles()((_) => ({
  removeIcon: {
    color: "red",
    cursor: "pointer",
  },
  adder: {
    display: "flex",
    flexDirection: "row",
    gap: "16px",
    margin: "32px 0px",
  },
  button: {
    maxWidth: "180px",
  },
  textField: {
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    margin: "32px 0px",
    fontSize: "24px",
  },
}));

export default function Validators() {
  const { classes } = useStyles();
  const [newEmail, setNewEmail] = useState("");
  const producerContext = useProducerContext();
  const { isAdmin } = useAuthContext();
  const router = useRouter();
  const producerId = router.query.producerId as string;
  const [producer, setProducer] = useState<Producer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  useEffect(() => {
    const loadData = async () => {
      if (isAdmin === undefined && !producerId && !producerContext.producerId) {
        return;
      }

      setIsLoading(false);

      if (isAdmin) {
        const unsubscribe = streamProducer(
          producerId,
          (snapshot) => {
            setProducer(snapshot.data());
          },
          () => {
            return;
          }
        );
        return () => unsubscribe();
      } else {
        setProducer(producerContext.producer);
      }
    };

    loadData();
  }, [
    isAdmin,
    producerId,
    producerContext.producerId,
    producerContext.producer,
  ]);

  const handleRemove = async (uid: string) => {
    if (!producer) {
      return;
    }
    if (producer.users.length === 1) {
      return;
    }
    await addProducerToUserFunction({
      producerId: producerId,
      producerName: producer.name,
      add: false,
      userRef: uid,
    });
  };

  const handleAdd = async (email: string) => {
    setButtonLoading(true);
    if (!producer) {
      setButtonLoading(false);
      return;
    }
    if (
      producer.users &&
      producer.users.map((user) => user.id).includes(email)
    ) {
      setButtonLoading(false);
      return;
    }
    await addProducerToUserFunction({
      producerId: producerId,
      producerName: producer.name,
      add: true,
      userRef: email,
    });
    setNewEmail("");
    setButtonLoading(false);
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  if (!isAdmin && producerId !== producerContext.producerId) {
    return <Unauthorized />;
  }

  return (
    <div>
      {isAdmin && (
        <GoBack text={"Volver a productoras"} route={"/admin/producers"} />
      )}
      {producer && (
        <>
          <h1 className={classes.title}>
            Agrega o elimina usuarios con acceso a {producer.name}
          </h1>
          <div className={classes.adder}>
            <TextField
              id="outlined-basic"
              label="Correo"
              variant="outlined"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className={classes.textField}
            />
            <LoadingButton
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={() => void handleAdd(newEmail)}
              loading={buttonLoading}
            >
              Agregar
            </LoadingButton>
          </div>
          <AlgoliaTable headers={["Correo", ""]}>
            <>
              {producer.users &&
                producer.users.map((user) => (
                  <Row key={user.id} user={user} handleRemove={handleRemove} />
                ))}
            </>
          </AlgoliaTable>
        </>
      )}
    </div>
  );
}

function Row({
  user,
  handleRemove,
}: {
  user: { email: string; id: string };
  handleRemove: (email: string) => Promise<void>;
}) {
  const { classes } = useStyles();
  // substract activationdate

  return (
    <TableRow key={user.id}>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <RemoveCircleIcon
          className={classes.removeIcon}
          onClick={() => void handleRemove(user.id)}
        ></RemoveCircleIcon>
      </TableCell>
    </TableRow>
  );
}
