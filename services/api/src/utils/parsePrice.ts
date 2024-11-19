export const parsePriceToCLP = (price: number): string => {
  return (
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    })
      .format(price)
      .replace("$", "") + " CLP"
  );
};
