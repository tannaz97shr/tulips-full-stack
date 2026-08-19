import type { DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import type { SessionUser, UserRole } from "@/modules/auth/types";

/**
 * Fields are picked explicitly (rather than spreading `doc.data()`) so
 * `passwordHash` and Firestore-internal fields (e.g. `createdAt`) never
 * leak into a session or API response. Same discipline as
 * `src/modules/catalog/lib/toProduct.ts`.
 */
export function toSessionUser(doc: QueryDocumentSnapshot | DocumentSnapshot): SessionUser {
  const data = doc.data() as { email: string; name: string; role: UserRole };
  return {
    id: doc.id,
    email: data.email,
    name: data.name,
    role: data.role,
  };
}
