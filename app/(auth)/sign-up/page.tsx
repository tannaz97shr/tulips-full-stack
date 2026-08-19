import Link from "next/link";
import { GoogleSignInButton } from "@/modules/auth/components/GoogleSignInButton";
import { SignUpForm } from "@/modules/auth/components/SignUpForm";
import { CONTENT } from "@/modules/auth/content";
import { ROUTES } from "@/shared/routes";

export default async function SignUpPage(props: PageProps<"/sign-up">) {
  const searchParams = await props.searchParams;
  const callbackUrlParam = searchParams.callbackUrl;
  const callbackUrl = typeof callbackUrlParam === "string" ? callbackUrlParam : ROUTES.home;

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl">{CONTENT.signUpPage.heading}</h1>
        <p className="text-md text-foreground/70">{CONTENT.signUpPage.subheading}</p>
      </div>
      <SignUpForm callbackUrl={callbackUrl} />
      <div className="flex items-center gap-sm text-sm text-foreground/50">
        <span className="h-px flex-1 bg-divider" />
        {CONTENT.divider}
        <span className="h-px flex-1 bg-divider" />
      </div>
      <GoogleSignInButton callbackUrl={callbackUrl} />
      <p className="text-center text-base text-foreground/70">
        {CONTENT.signUpPage.hasAccountPrompt}{" "}
        <Link href={ROUTES.signIn} className="text-accent">
          {CONTENT.signUpPage.signInLink}
        </Link>
      </p>
    </div>
  );
}
