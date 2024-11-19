export function formatPriceToCLP(value: number | string): string {
  const price = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(price)) {
    throw new Error(
      "Invalid input: The value must be a number or a string that represents a number."
    );
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
