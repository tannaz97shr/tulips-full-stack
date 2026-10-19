/**
 * Plain calendar dates (no time, no timezone). Two string formats:
 * - ISO "YYYY-MM-DD" — what the API and Firestore store.
 * - Display "dd/mm/yyyy" — what Australian customers read and type.
 *
 * Deliberately string-based rather than `new Date("YYYY-MM-DD")`, which
 * parses as UTC midnight and can shift a day when read in a local timezone.
 */

/** Delivery dates are interpreted in the shop's timezone. */
export const SHOP_TIME_ZONE = "Australia/Melbourne";

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
// Accepts d/m/yyyy and dd/mm/yyyy, with "/", "." or "-" separators.
const DISPLAY_PATTERN = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;

function isRealDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1) return false;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return day <= daysInMonth;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** "YYYY-MM-DD" → true only if it names a real calendar day. */
export function isValidIsoDate(value: string): boolean {
  const match = ISO_PATTERN.exec(value);
  if (!match) return false;
  return isRealDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

/** "dd/mm/yyyy" → "YYYY-MM-DD", or `null` if it isn't a real calendar day. */
export function parseDisplayDate(value: string): string | null {
  const match = DISPLAY_PATTERN.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (!isRealDate(year, month, day)) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** "YYYY-MM-DD" → "dd/mm/yyyy". Returns "" for anything that isn't a valid ISO date. */
export function formatDisplayDate(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/** Today's date as "YYYY-MM-DD" in `timeZone`. */
export function todayIso(timeZone: string = SHOP_TIME_ZONE, now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** True when `isoDate` is a real date that is today or later in the shop's timezone. */
export function isTodayOrFutureIso(isoDate: string, now: Date = new Date()): boolean {
  // ISO dates compare correctly as strings.
  return isValidIsoDate(isoDate) && isoDate >= todayIso(SHOP_TIME_ZONE, now);
}
