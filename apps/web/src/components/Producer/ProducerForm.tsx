import React, { useEffect, useState } from "react";
import { Chip, IconButton, styled, TextField } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { createProducerFunction } from "@/firebase/functions/producers/createProducer";
import LoadingButton from "../Materials/LoadingButton";
import { useRouter } from "next/router";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import type { Producer, ProducerRating } from "@/firebase/interfaces/producers";
import { updateProducerFunction } from "@/firebase/functions/producers/updateProducer";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});
const useStyles = makeStyles()(() => ({
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    marginBottom: "64px",
    gap: "32px",
  },
  row: {
    marginTop: "32px",
    maxWidth: "500px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    gap: "16px",
  },
  image: {
    marginTop: "20px",
    width: "200px",
    height: "200px",
    position: "relative",
  },
  button: {
    marginTop: "20px",
    width: "200px",
  },
}));

const ProducerForm = ({
  edit = false,
  producerEdit,
  producerId = "",
}: {
  edit?: boolean;
  producerEdit?: Producer;
  producerId?: string;
}) => {
  const [producer, setProducer] = useState<{
    image: string;
    name: string;

    description: string;
    instagramProfile: string;
    backgroundImage: string;
    users: { id: string; email: string }[];
    domains: string[];
    ratings: ProducerRating;
  }>({
    image: "",
    name: "",

    description: "",
    instagramProfile: "",
    backgroundImage: "",
    users: [],
    domains: [],
    ratings: {
      ratingPoint: 0,
      ratingTotal: 0,
      ratingNumber: 0,
    },
  });
  const [domainInput, setDomainInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { classes } = useStyles();
  const router = useRouter();
  const { isAdmin } = useAuthContext();
  useEffect(() => {
    if (edit && producerEdit) {
      setProducer(producerEdit);
    }
  }, [edit, producerEdit, setProducer]);

  const handleChange =
    (prop: keyof typeof producer) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setProducer({ ...producer, [prop]: event.target.value });
    };

  const handleFileChange =
    (prop: keyof typeof producer) =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      console.log(file);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProducer((prev) => ({
            ...prev,
            [prop]: reader.result?.toString() || "",
          }));
        };
        reader.readAsDataURL(file);
      }
    };

  const handleSubmit = async () => {
    if (!producer.image) {
      console.error("No image selected");
      return;
    }
    setIsSubmitting(true);

    try {
      console.log("Creating producer", producer);
      if (edit) {
        await updateProducerFunction({
          producer: producer,
          producerId: producerId,
        });
      } else {
        await createProducerFunction({
          ...producer,
        });
      }
      if (isAdmin) {
        router.push("/admin/producers");
      } else {
        router.push("/producers");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setIsSubmitting(false);
  };

  const handleAddDomain = () => {
    if (domainInput && !producer.domains) {
      setProducer((prev) => ({
        ...prev,
        domains: [domainInput],
      }));
      setDomainInput("");
    } else if (domainInput && !producer.domains.includes(domainInput)) {
      setProducer((prev) => ({
        ...prev,
        domains: [
          ...prev.domains,
          domainInput.split("@").length > 1 ? domainInput : "",
        ].filter(Boolean),
      }));
      setDomainInput("");
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    setProducer((prev) => ({
      ...prev,
      domains: prev.domains.filter((domain) => domain !== domainToRemove),
    }));
  };

  return (
    <form className={classes.column}>
      <div className={classes.row}>
        <p>1. Selecciona el nombre de la productora</p>
        <TextField
          value={producer.name}
          onChange={handleChange("name")}
          fullWidth
        />
      </div>
      <div className={classes.row}>
        <p>2. Escribe la descripción</p>
        <TextField
          value={producer.description}
          onChange={handleChange("description")}
          fullWidth
          multiline
          maxRows={16}
        />
      </div>
      <div className={classes.row}>
        <p>3. Imagen de tu productora</p>
        <div className={classes.button}>
          <LoadingButton
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={(event) => {
                handleFileChange("image")(event);
              }}
              maxLength={8 * 1024 * 1024}
            />
          </LoadingButton>
        </div>

        {producer.image && (
          <div className={classes.image}>
            <Image
              src={producer.image}
              alt="Uploaded file"
              className={classes.image}
              fill
            />
          </div>
        )}
      </div>
      <div className={classes.row}>
        <p>4. Imagen de fondo</p>
        <div className={classes.button}>
          <LoadingButton
            component="label"
            role={undefined}
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
          >
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={(event) => {
                handleFileChange("backgroundImage")(event);
              }}
              maxLength={8 * 1024 * 1024}
            />
          </LoadingButton>
        </div>
        {producer.backgroundImage && (
          <div className={classes.image}>
            <Image
              src={producer.backgroundImage}
              alt="Uploaded file"
              className={classes.image}
              fill
            />
          </div>
        )}
      </div>

      <div className={classes.row}>
        <p>5. Nombre usuario de instagram</p>
        <TextField
          value={producer.instagramProfile}
          onChange={handleChange("instagramProfile")}
          fullWidth
        />
      </div>
      <div className={classes.row}>
        <p>
          6. Emails asociados a la productora (ej: juan@byearly.com, debes poner
          solo byearly.com)
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <TextField
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            fullWidth
          />
          <IconButton onClick={handleAddDomain} color="primary">
            <AddCircleIcon />
          </IconButton>
        </div>
        {producer.domains && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginTop: "8px",
            }}
          >
            {producer.domains.map((domain) => (
              <Chip
                key={domain}
                label={domain}
                onDelete={() => handleRemoveDomain(domain)}
                deleteIcon={<RemoveCircleIcon />}
              />
            ))}
          </div>
        )}
      </div>

      <div className={classes.button}>
        <LoadingButton
          variant="contained"
          color="primary"
          onClick={() => {
            handleSubmit();
          }}
          loading={isSubmitting}
        >
          Guardar
        </LoadingButton>
      </div>
    </form>
  );
};

export default ProducerForm;
