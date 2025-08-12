import { beforeEach, describe, expect, it, vi } from "vitest";
import { startTimer } from "./timer";

describe("startTimer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("should create a timer with default label", () => {
    const [point, end] = startTimer();

    expect(console.log).toHaveBeenCalledWith("Timer @ start");
    expect(typeof point).toBe("function");
    expect(typeof end).toBe("function");
  });

  it("should create a timer with custom label", () => {
    const [point, end] = startTimer("CustomTimer");

    expect(console.log).toHaveBeenCalledWith("CustomTimer @ start");
    expect(typeof point).toBe("function");
    expect(typeof end).toBe("function");
  });

  it("should log point with default label when no label provided", () => {
    // Mock Date.now to return different values for each call
    let callCount = 0;
    vi.spyOn(Date, "now").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return 1000; // start
      if (callCount === 2) return 1500; // point
      return 2000; // fallback
    });

    const [point] = startTimer("TestTimer");
    point();

    expect(console.log).toHaveBeenCalledWith(
      "TestTimer @ point 1 is 500 ms (+ 500 ms)"
    );
  });

  it("should log point with custom label", () => {
    // Mock Date.now to return different values for each call
    let callCount = 0;
    vi.spyOn(Date, "now").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return 1000; // start
      if (callCount === 2) return 1500; // point
      return 2000; // fallback
    });

    const [point] = startTimer("TestTimer");
    point("custom point");

    expect(console.log).toHaveBeenCalledWith(
      "TestTimer @ custom point is 500 ms (+ 500 ms)"
    );
  });

  it("should log end with correct timing", () => {
    // Mock Date.now to return different values for each call
    let callCount = 0;
    vi.spyOn(Date, "now").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return 1000; // start
      if (callCount === 2) return 1500; // point
      if (callCount === 3) return 2000; // end (first call)
      if (callCount === 4) return 2000; // end (second call)
      return 2500; // fallback
    });

    const [point, end] = startTimer("TestTimer");
    point("middle");
    end();

    expect(console.log).toHaveBeenCalledWith(
      "TestTimer @ end is 1000 ms (+ 500 ms)"
    );
  });

  it("should track multiple points correctly", () => {
    // Mock Date.now to return different values for each call
    let callCount = 0;
    vi.spyOn(Date, "now").mockImplementation(() => {
      callCount++;
      if (callCount === 1) return 1000; // start
      if (callCount === 2) return 1500; // point 1
      if (callCount === 3) return 2000; // point 2
      if (callCount === 4) return 2500; // point 3
      return 3000; // fallback
    });

    const [point] = startTimer("TestTimer");
    point();
    point();
    point();

    expect(console.log).toHaveBeenCalledWith(
      "TestTimer @ point 1 is 500 ms (+ 500 ms)"
    );
    expect(console.log).toHaveBeenCalledWith(
      "TestTimer @ point 2 is 1000 ms (+ 500 ms)"
    );
    expect(console.log).toHaveBeenCalledWith(
      "TestTimer @ point 3 is 1500 ms (+ 500 ms)"
    );
  });
});
