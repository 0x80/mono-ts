export const formatDate = (dateString: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
    timeZone: "America/Santiago",
  };
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", options);
};
