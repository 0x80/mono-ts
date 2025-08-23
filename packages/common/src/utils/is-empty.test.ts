import { describe, expect, it } from "vitest";
import { isEmpty } from "./is-empty.ts";

describe("isEmpty", () => {
  it("should return true for empty arrays", () => {
    expect(isEmpty([])).toBe(true);
  });

  it("should return false for non-empty arrays", () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
    expect(isEmpty(["a", "b"])).toBe(false);
    expect(isEmpty([null])).toBe(false);
    expect(isEmpty([undefined])).toBe(false);
    expect(isEmpty([0])).toBe(false);
    expect(isEmpty([""])).toBe(false);
  });

  it("should work with arrays of different types", () => {
    expect(isEmpty([1, "string", true, null, undefined])).toBe(false);
    expect(isEmpty([{ key: "value" }])).toBe(false);
    expect(
      isEmpty([
        [1, 2],
        [3, 4],
      ]),
    ).toBe(false);
  });

  it("should act as a type guard", () => {
    const testArray: unknown[] = [];

    if (isEmpty(testArray)) {
      // TypeScript should know this is an empty array type
      expect(testArray).toEqual([]);
    }
  });
});
