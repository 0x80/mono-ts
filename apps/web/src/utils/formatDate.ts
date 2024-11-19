export const formatDate = (date: Date | undefined) => {
  if (!date) return "Error";
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return date.toLocaleString("es-ES", options);
};
