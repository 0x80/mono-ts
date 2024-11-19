export const calculateServiceFee = ({
  total,
  count,
  serviceFee,
  serviceFeeType,
}: {
  total: number;
  count: number;
  serviceFee: number;
  serviceFeeType: string;
}): number => {
  if (serviceFeeType === "Percentage") {
    return total * serviceFee;
  }
  if (serviceFeeType === "Fixed") {
    return serviceFee * count;
  }
  return serviceFee;
};
