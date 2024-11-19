export function formatDateWithOffset(date: Date) {
  // Get the offset in minutes
  const offsetInMinutes = date.getTimezoneOffset();

  // Convert the offset to hours and minutes
  const offsetHours = Math.abs(Math.floor(offsetInMinutes / 60));
  const offsetMinutes = Math.abs(offsetInMinutes % 60);
  // Determine the sign of the offset
  const offsetSign = offsetInMinutes < 0 ? "+" : "-";

  // Pad the hours and minutes with leading zeros if necessary
  const formattedOffset =
    offsetSign +
    ("0" + offsetHours).slice(-2) +
    ":" +
    ("0" + offsetMinutes).slice(-2);

  // Get the date components
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);

  // Construct the formatted date string
  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formattedOffset}`;

  return formattedDate;
}
