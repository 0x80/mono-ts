export const getActivationDate = (date: Date | undefined, hours: number) => {
  if (!date) return new Date();
  const eventActivationDate = date;
  eventActivationDate.setMinutes(
    eventActivationDate.getMinutes() - (hours ?? 0) * 60
  );
  return eventActivationDate;
};
