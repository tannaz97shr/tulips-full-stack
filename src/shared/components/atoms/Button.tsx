import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

const baseClasses =
  "inline-flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-full border border-transparent font-heading text-sm leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-45";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent px-md py-sm text-background hover:bg-accent-600 active:bg-accent-700",
  secondary: "border-divider px-md py-sm hover:bg-foreground/7 active:bg-foreground/14",
  ghost: "px-xs py-sm text-accent hover:bg-accent/10 active:bg-accent/18",
  icon: "h-9 w-9 hover:bg-foreground/7",
};

interface CommonProps {
  variant?: ButtonVariant;
  block?: boolean;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({ variant = "primary", block, className, href, ...props }: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], block && "mt-sm w-full", className);

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)} />
    );
  }

  return <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} />;
}
