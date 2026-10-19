import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { ROUTES } from "@/shared/routes";
import { AccountView } from "@/modules/account/components/AccountView";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(ROUTES.signInWithCallback(ROUTES.account));
  }

  return (
    <AccountView
      name={session.user.name || session.user.email || ""}
      email={session.user.email ?? ""}
      isAdmin={session.user.role === "admin"}
      signOutForm={(button) => (
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: ROUTES.home });
          }}
        >
          {button}
        </form>
      )}
    />
  );
}
