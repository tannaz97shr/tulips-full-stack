import { describe, expect, test } from "bun:test";
import { formatDisplayDate, isTodayOrFutureIso, isValidIsoDate, parseDisplayDate, todayIso } from "./calendarDate";

describe("parseDisplayDate", () => {
  test("parses dd/mm/yyyy into ISO", () => {
    expect(parseDisplayDate("22/10/2026")).toBe("2026-10-22");
  });

  test("accepts single-digit day/month and other separators", () => {
    expect(parseDisplayDate("5/3/2027")).toBe("2027-03-05");
    expect(parseDisplayDate("05-03-2027")).toBe("2027-03-05");
    expect(parseDisplayDate(" 05.03.2027 ")).toBe("2027-03-05");
  });

  test("reads day first, never US month-first", () => {
    expect(parseDisplayDate("03/05/2027")).toBe("2027-05-03");
  });

  test("rejects dates that don't exist", () => {
    expect(parseDisplayDate("31/04/2027")).toBeNull();
    expect(parseDisplayDate("29/02/2027")).toBeNull();
    expect(parseDisplayDate("13/13/2027")).toBeNull();
    expect(parseDisplayDate("00/01/2027")).toBeNull();
  });

  test("accepts 29 February in a leap year", () => {
    expect(parseDisplayDate("29/02/2028")).toBe("2028-02-29");
  });

  test("rejects other formats", () => {
    expect(parseDisplayDate("")).toBeNull();
    expect(parseDisplayDate("2027-03-05")).toBeNull();
    expect(parseDisplayDate("5/3/27")).toBeNull();
    expect(parseDisplayDate("tomorrow")).toBeNull();
  });
});

describe("formatDisplayDate", () => {
  test("formats ISO as dd/mm/yyyy", () => {
    expect(formatDisplayDate("2026-10-22")).toBe("22/10/2026");
  });

  test("returns empty string for invalid input", () => {
    expect(formatDisplayDate("")).toBe("");
    expect(formatDisplayDate("2026-02-30")).toBe("");
  });

  test("round-trips with parseDisplayDate", () => {
    expect(parseDisplayDate(formatDisplayDate("2027-01-09"))).toBe("2027-01-09");
  });
});

describe("isValidIsoDate", () => {
  test("validates real ISO dates only", () => {
    expect(isValidIsoDate("2026-12-31")).toBe(true);
    expect(isValidIsoDate("2026-11-31")).toBe(false);
    expect(isValidIsoDate("22/10/2026")).toBe(false);
  });
});

describe("todayIso / isTodayOrFutureIso (Australia/Melbourne)", () => {
  // 2026-10-19 21:30 UTC is already 2026-10-20 08:30 in Melbourne (AEDT, UTC+11).
  const now = new Date("2026-10-19T21:30:00Z");

  test("uses the shop's date, not UTC's", () => {
    expect(todayIso(undefined, now)).toBe("2026-10-20");
  });

  test("today in Melbourne is allowed, yesterday is not", () => {
    expect(isTodayOrFutureIso("2026-10-20", now)).toBe(true);
    expect(isTodayOrFutureIso("2026-10-21", now)).toBe(true);
    expect(isTodayOrFutureIso("2026-10-19", now)).toBe(false);
  });

  test("invalid dates are never accepted", () => {
    expect(isTodayOrFutureIso("2099-02-30", now)).toBe(false);
    expect(isTodayOrFutureIso("", now)).toBe(false);
  });
});
