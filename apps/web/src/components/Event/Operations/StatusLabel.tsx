import React from "react";
import { Chip } from "@mui/material";

const translateStatus = (status: string) => {
  switch (status) {
    case "Rejected":
      return "Rechazado";
    case "Draft":
      return "Borrador";
    case "External":
      return "Externo";
    case "Active":
      return "Activo";
    case "Approved":
      return "Aprobado";
    case "Transferred":
      return "Transferido";
    case "Visible":
      return "Visible";
    case "InReview":
      return "En Revisión";
    case "Expired":
      return "Expirado";
    case "Pending":
      return "Pendiente";
    case "Validated":
      return "Validado";
    case "Reselling":
      return "Revendiendose";
    case "Private":
      return "Privado";
    default:
      return status;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "Rechazado":
      return { background: "#D9534F", text: "#FFFFFF" }; // Rojo oscuro para "Rechazado"
    case "Borrador":
      return { background: "#FFA07A", text: "#FFFFFF" }; // Azul claro para "Borrador"
    case "Pendiente":
      return { background: "#FFA07A", text: "#FFFFFF" }; // Azul claro para "Borrador"
    case "Aprobado":
      return { background: "#F0AD4E", text: "#FFFFFF" }; // Azul claro para "Borrador"
    case "Validado":
      return { background: "black", text: "#FFFFFF" }; // Azul claro para "Borrador"
    case "Externo":
      return { background: "#F0AD4E", text: "#FFFFFF" }; // Amarillo para "Externo"
    case "Activo":
      return { background: "#5CB85C", text: "#FFFFFF" }; // Verde para "Activo"
    case "Transferido":
      return { background: "#5CB85C", text: "#FFFFFF" }; // Verde para "Activo"
    case "Visible":
      return { background: "#5BC0E8", text: "#FFFFFF" }; // Azul para "Visible"
    case "Revendiendose":
      return { background: "#5BC0E8", text: "#FFFFFF" }; // Azul para "Visible"
    case "En Revisión":
      return { background: "#F0AD4E", text: "#FFFFFF" }; // Amarillo oscuro para "En Revisión"
    case "Privado":
      return { background: "black", text: "#FFFFFF" }; // Amarillo oscuro para "En Revisión"
    default:
      return { background: "#F7F7F7", text: "#333333" }; // Gris claro para estado desconocido
  }
};

export const StatusLabel = ({ status }: { status: string }) => {
  const { background, text } = statusColor(translateStatus(status));

  return (
    <Chip
      label={translateStatus(status)}
      style={{
        backgroundColor: background,
        color: text,
        fontWeight: "bold",
        borderRadius: "16px",
        padding: "8px 12px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
      }}
      className="statusChip"
    />
  );
};

export default StatusLabel;
