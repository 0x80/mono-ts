import React, { useEffect } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import LoadingButton from "./LoadingButton";

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

export default function InputFileUpload({
  setUploadedFile,
  id = "fileUploaded",
}: {
  setUploadedFile: Dispatch<
    SetStateAction<{
      id: string;
      file: string;
    }>
  >;
  id?: string;
}) {
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const uploadedFileDataUrl = e.target?.result;
      if (typeof uploadedFileDataUrl !== "string") {
        return;
      }
      sessionStorage.setItem(id, uploadedFileDataUrl);
      setUploadedFile({ id, file: uploadedFileDataUrl });
    };

    if (!file) return;

    reader.readAsDataURL(file);
  };

  // make a const named image that this the local storage image

  useEffect(() => {
    const storedFile = sessionStorage.getItem(id);
    if (storedFile) {
      setUploadedFile({ id, file: storedFile });
    }
  }, [setUploadedFile, id]);
  return (
    <LoadingButton
      component="label"
      role={undefined}
      variant="contained"
      tabIndex={-1}
      startIcon={<CloudUploadIcon />}
    >
      Subir Imagen
      <VisuallyHiddenInput
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        maxLength={8 * 1024 * 1024}
      />
    </LoadingButton>
  );
}
