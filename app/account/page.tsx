import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/shared/components/atoms/Button";
import { ROUTES } from "@/shared/routes";

// Throwaway placeholder — proves the proxy redirect + page-level auth()
// check end to end. A real account UI is future work.
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(ROUTES.signInWithCallback(ROUTES.account));
  }

  return (
    <div className="mx-auto flex w-full max-w-[42rem] flex-1 flex-col gap-lg px-lg py-2xl">
      <h1 className="font-heading text-2xl">Welcome, {session.user.name}</h1>
      <p className="text-md text-foreground/70">
        {session.user.email} · {session.user.role}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: ROUTES.home });
        }}
      >
        <Button type="submit" variant="secondary">
          Sign out
        </Button>
      </form>
    </div>
  );
}
