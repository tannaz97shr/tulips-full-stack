import Link from "next/link";
import { GoogleSignInButton } from "@/modules/auth/components/GoogleSignInButton";
import { SignInForm } from "@/modules/auth/components/SignInForm";
import { ROUTES } from "@/shared/routes";

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const searchParams = await props.searchParams;
  const callbackUrlParam = searchParams.callbackUrl;
  const callbackUrl = typeof callbackUrlParam === "string" ? callbackUrlParam : ROUTES.home;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl">Sign in</h1>
        <p className="text-md text-foreground/70">Welcome back to Tulips.</p>
      </div>
      <SignInForm callbackUrl={callbackUrl} />
      <div className="flex items-center gap-sm text-sm text-foreground/50">
        <span className="h-px flex-1 bg-divider" />
        or
        <span className="h-px flex-1 bg-divider" />
      </div>
      <GoogleSignInButton callbackUrl={callbackUrl} />
      <p className="text-center text-base text-foreground/70">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.signUp} className="text-accent">
          Sign up
        </Link>
      </p>
    </div>
  );
}
