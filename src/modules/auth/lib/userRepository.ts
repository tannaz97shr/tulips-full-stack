import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/shared/lib/firebase-admin";
import { toSessionUser } from "@/modules/auth/lib/toSessionUser";
import type { SessionUser } from "@/modules/auth/types";

function usersCollection() {
  return getAdminFirestore().collection("users");
}

interface UserRecord {
  sessionUser: SessionUser;
  passwordHash?: string;
}

async function findUserRecordByEmail(email: string): Promise<UserRecord | null> {
  const snapshot = await usersCollection().where("email", "==", email).limit(1).get();
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data() as { passwordHash?: string };
  return {
    sessionUser: toSessionUser(doc),
    passwordHash: data.passwordHash,
  };
}

export function findUserByEmail(email: string): Promise<UserRecord | null> {
  return findUserRecordByEmail(email);
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<SessionUser> {
  const ref = usersCollection().doc();
  await ref.set({
    email: input.email,
    name: input.name,
    passwordHash: input.passwordHash,
    role: "customer",
    createdAt: FieldValue.serverTimestamp(),
  });
  const doc = await ref.get();
  return toSessionUser(doc);
}

export async function findOrCreateGoogleUser(input: { email: string; name: string }): Promise<SessionUser> {
  const existing = await findUserRecordByEmail(input.email);
  if (existing) return existing.sessionUser;

  const ref = usersCollection().doc();
  await ref.set({
    email: input.email,
    name: input.name,
    role: "customer",
    createdAt: FieldValue.serverTimestamp(),
  });
  const doc = await ref.get();
  return toSessionUser(doc);
}

/**
 * Batch-fetches users by id for the admin order queue's customer join.
 * No `getAll`/`documentId() "in"` batch-read helper exists elsewhere in
 * this repo — mirrors `settleOrder`'s `Promise.all` of individual
 * `.doc(id).get()` calls instead of introducing a new pattern. Ids with no
 * matching (or deleted) user doc are simply absent from the returned map.
 */
export async function getUsersByIds(userIds: string[]): Promise<Map<string, SessionUser>> {
  const uniqueIds = [...new Set(userIds)];
  const snapshots = await Promise.all(uniqueIds.map((id) => usersCollection().doc(id).get()));

  const usersById = new Map<string, SessionUser>();
  snapshots.forEach((snapshot, index) => {
    if (snapshot.exists) {
      usersById.set(uniqueIds[index], toSessionUser(snapshot));
    }
  });
  return usersById;
}
