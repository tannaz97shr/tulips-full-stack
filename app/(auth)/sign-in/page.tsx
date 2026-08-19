import Link from "next/link";
import { GoogleSignInButton } from "@/modules/auth/components/GoogleSignInButton";
import { SignInForm } from "@/modules/auth/components/SignInForm";
import { CONTENT } from "@/modules/auth/content";
import { ROUTES } from "@/shared/routes";

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const searchParams = await props.searchParams;
  const callbackUrlParam = searchParams.callbackUrl;
  const callbackUrl = typeof callbackUrlParam === "string" ? callbackUrlParam : ROUTES.home;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl">{CONTENT.signInPage.heading}</h1>
        <p className="text-md text-foreground/70">{CONTENT.signInPage.subheading}</p>
      </div>
      <SignInForm callbackUrl={callbackUrl} />
      <div className="flex items-center gap-sm text-sm text-foreground/50">
        <span className="h-px flex-1 bg-divider" />
        {CONTENT.divider}
        <span className="h-px flex-1 bg-divider" />
      </div>
      <GoogleSignInButton callbackUrl={callbackUrl} />
      <p className="text-center text-base text-foreground/70">
        {CONTENT.signInPage.noAccountPrompt}{" "}
        <Link href={ROUTES.signUp} className="text-accent">
          {CONTENT.signInPage.signUpLink}
        </Link>
      </p>
    </div>
  );
}
