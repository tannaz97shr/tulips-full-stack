import Link from "next/link";
import { GoogleSignInButton } from "@/modules/auth/components/GoogleSignInButton";
import { SignUpForm } from "@/modules/auth/components/SignUpForm";

export default async function SignUpPage(props: PageProps<"/sign-up">) {
  const searchParams = await props.searchParams;
  const callbackUrlParam = searchParams.callbackUrl;
  const callbackUrl = typeof callbackUrlParam === "string" ? callbackUrlParam : "/";

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl">Create an account</h1>
        <p className="text-md text-foreground/70">Join Tulips to track orders and check out faster.</p>
      </div>
      <SignUpForm callbackUrl={callbackUrl} />
      <div className="flex items-center gap-sm text-sm text-foreground/50">
        <span className="h-px flex-1 bg-divider" />
        or
        <span className="h-px flex-1 bg-divider" />
      </div>
      <GoogleSignInButton callbackUrl={callbackUrl} />
      <p className="text-center text-base text-foreground/70">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-accent">
          Sign in
        </Link>
      </p>
    </div>
  );
}
