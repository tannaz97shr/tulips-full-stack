/**
 * One-off migration: normalizes `colors`/`occasions` on existing `products`
 * docs to the canonical capitalized values in src/modules/catalog/constants.ts
 * (see specs/known-issues.md — "Taxonomy casing & completeness mismatch").
 *
 * Dry-run by default: prints a per-doc before/after diff and writes nothing.
 * Pass --apply to actually write the normalized values to Firestore.
 *
 * Run with: bun run scripts/migrate-taxonomy-casing.ts [--apply]
 * (Bun auto-loads .env.local; do not run with plain `node`.)
 */
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { COLORS, OCCASIONS } from "@/modules/catalog/constants";
import { normalizeTaxonomyValues } from "@/modules/catalog/lib/normalizeTaxonomyValue";

const apply = process.argv.includes("--apply");

function arraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function main() {
  const db = getAdminFirestore();
  const snapshot = await db.collection("products").get();

  const batch = db.batch();
  let changedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const colors: string[] = data.colors ?? [];
    const occasions: string[] = data.occasions ?? [];

    const nextColors = normalizeTaxonomyValues(colors, COLORS);
    const nextOccasions = normalizeTaxonomyValues(occasions, OCCASIONS);

    if (arraysEqual(colors, nextColors) && arraysEqual(occasions, nextOccasions)) {
      continue;
    }

    changedCount += 1;
    console.log(`${doc.id}:`);
    if (!arraysEqual(colors, nextColors)) {
      console.log(`  colors:    ${JSON.stringify(colors)} -> ${JSON.stringify(nextColors)}`);
    }
    if (!arraysEqual(occasions, nextOccasions)) {
      console.log(`  occasions: ${JSON.stringify(occasions)} -> ${JSON.stringify(nextOccasions)}`);
    }

    if (apply) {
      batch.update(doc.ref, { colors: nextColors, occasions: nextOccasions });
    }
  }

  if (changedCount === 0) {
    console.log("No products need normalization.");
    return;
  }

  if (!apply) {
    console.log(`\n${changedCount} product(s) would be updated. Re-run with --apply to write these changes.`);
    return;
  }

  await batch.commit();
  console.log(`\nUpdated ${changedCount} product(s).`);
}

main().catch((error: unknown) => {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
