import { describe, expect, test } from "bun:test";
import { gstIncluded, sumLineItems } from "./pricing";

describe("gstIncluded", () => {
  test("is exactly one eleventh of a GST-inclusive total", () => {
    expect(gstIncluded(11000)).toBe(1000); // $110.00 contains $10.00
    expect(gstIncluded(1100)).toBe(100);
  });

  test("rounds to whole cents", () => {
    expect(gstIncluded(9800)).toBe(891); // $98.00 → $8.909… → $8.91
    expect(gstIncluded(1500)).toBe(136); // $15.00 → $1.3636… → $1.36
    expect(gstIncluded(5)).toBe(0);
    expect(gstIncluded(6)).toBe(1);
  });

  test("is zero for an empty order", () => {
    expect(gstIncluded(0)).toBe(0);
  });
});

describe("sumLineItems", () => {
  test("total is the plain sum of GST-inclusive line items — nothing added on top", () => {
    const items = [
      { price: 9800, quantity: 1 },
      { price: 1500, quantity: 2 },
    ];
    expect(sumLineItems(items)).toBe(12800);
  });

  test("empty cart sums to zero", () => {
    expect(sumLineItems([])).toBe(0);
  });
});
