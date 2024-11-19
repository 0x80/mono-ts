export function formatDateAndTime(date: Date): {
  dateString: string;
  timeString: number;
} {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth is zero-based
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const dateString = `${day}/${month}/${year}`;
  const timeString = parseInt(`${hours}${minutes}`, 10);

  return { dateString, timeString };
}
