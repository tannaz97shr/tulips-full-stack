import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Throwaway placeholder — proves role === "admin" is enforced server-side
// even though proxy.ts already redirects non-admins. A real admin UI is
// future work.
export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/admin");
  }
  if (session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-[42rem] flex-1 flex-col gap-lg px-lg py-2xl">
      <h1 className="font-heading text-2xl">Admin</h1>
      <p className="text-md text-foreground/70">
        Signed in as {session.user.email} (admin).
      </p>
    </div>
  );
}
