import { describe, expect, test } from "bun:test";
import { orderTotalsView } from "./orderTotals";

describe("orderTotalsView", () => {
  test("GST-inclusive orders show the total and the GST it contains", () => {
    expect(orderTotalsView({ subtotal: 9800, tax: 891, total: 9800, gstInclusive: true })).toEqual({
      kind: "gst-inclusive",
      total: 9800,
      gstIncluded: 891,
    });
  });

  test("legacy orders (no flag) keep the breakdown they were actually charged", () => {
    expect(orderTotalsView({ subtotal: 9800, tax: 980, total: 10780 })).toEqual({
      kind: "gst-added",
      subtotal: 9800,
      gst: 980,
      total: 10780,
    });
  });
});
