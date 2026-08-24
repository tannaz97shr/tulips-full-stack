import { auth } from "@/auth";
import type { Session } from "next-auth";

interface RequireAdminSessionResult {
  session?: Session;
  error?: Response;
}

/** Every admin write route calls this independently — the app/admin/layout.tsx page gate is not sufficient on its own. */
export async function requireAdminSession(): Promise<RequireAdminSessionResult> {
  const session = await auth();
  if (!session?.user) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "admin") {
    return { error: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
