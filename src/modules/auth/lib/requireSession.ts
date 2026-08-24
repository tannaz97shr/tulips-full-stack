import { auth } from "@/auth";
import type { Session } from "next-auth";

type RequireSessionResult = { session: Session; error?: undefined } | { session?: undefined; error: Response };

/** Every cart/checkout/order write or read route calls this independently — proxy.ts's route matcher excludes /api, so page-level protection is not sufficient on its own. */
export async function requireSession(): Promise<RequireSessionResult> {
  const session = await auth();
  if (!session?.user) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}
