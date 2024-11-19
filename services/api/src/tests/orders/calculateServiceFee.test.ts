import { calculateServiceFee } from "../../events/utils";

describe("calculateServiceFee", () => {
  it("should calculate the service fee as a percentage of the total when serviceFeeType is 'Percentage'", () => {
    const total = 1000;
    const count = 5;
    const serviceFee = 0.1; // 10%
    const serviceFeeType = "Percentage";

    const result = calculateServiceFee({
      total,
      count,
      serviceFee,
      serviceFeeType,
    });
    expect(result).toBe(100); // 1000 * 0.1 = 100
  });

  it("should calculate the service fee as a fixed amount per count when serviceFeeType is 'Fixed'", () => {
    const total = 1000;
    const count = 5;
    const serviceFee = 20;
    const serviceFeeType = "Fixed";

    const result = calculateServiceFee({
      total,
      count,
      serviceFee,
      serviceFeeType,
    });
    expect(result).toBe(serviceFee * count); // 20 * 5 = 100
  });

  it("should return the service fee directly when serviceFeeType is neither 'Percentage' nor 'Fixed'", () => {
    const total = 1000;
    const count = 5;
    const serviceFee = 50;
    const serviceFeeType = "OtherType";

    const result = calculateServiceFee({
      total,
      count,
      serviceFee,
      serviceFeeType,
    });
    expect(result).toBe(serviceFee); // 50
  });

  it("should return 0 when serviceFeeType is 'Percentage' and total is 0", () => {
    const total = 0;
    const count = 5;
    const serviceFee = 0.1; // 10%
    const serviceFeeType = "Percentage";

    const result = calculateServiceFee({
      total,
      count,
      serviceFee,
      serviceFeeType,
    });
    expect(result).toBe(0);
  });

  it("should return 0 when serviceFeeType is 'Fixed' and count is 0", () => {
    const total = 1000;
    const count = 0;
    const serviceFee = 20;
    const serviceFeeType = "Fixed";

    const result = calculateServiceFee({
      total,
      count,
      serviceFee,
      serviceFeeType,
    });
    expect(result).toBe(0);
  });
});
