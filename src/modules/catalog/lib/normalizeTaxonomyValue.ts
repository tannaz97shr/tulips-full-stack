/**
 * Case-insensitively matches a raw taxonomy value (e.g. Firestore data
 * seeded before COLORS/OCCASIONS settled on a capitalized convention)
 * against a canonical list, returning the canonical-cased value. Falls
 * back to the original value when nothing matches, so a genuinely
 * unrecognized value stays visible (and still fails schema validation)
 * instead of silently disappearing.
 */
export function normalizeTaxonomyValue<T extends string>(raw: string, canonical: readonly T[]): T | string {
  const match = canonical.find((value) => value.toLowerCase() === raw.toLowerCase());
  return match ?? raw;
}

export function normalizeTaxonomyValues<T extends string>(raw: string[], canonical: readonly T[]): (T | string)[] {
  return raw.map((value) => normalizeTaxonomyValue(value, canonical));
}
