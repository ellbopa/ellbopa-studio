import Link from "next/link";
import type { ComponentProps } from "react";

type CtaButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary";
};

export function CtaButton({ className = "", variant = "primary", ...props }: CtaButtonProps) {
  const classes =
    variant === "primary"
      ? "bg-studio-red text-white glow-button hover:scale-[1.02]"
      : "border border-studio-gold/40 bg-white/5 text-studio-gold hover:bg-studio-gold hover:text-black";

  return (
    <Link
      className={`inline-flex min-h-11 items-center justify-center rounded-md px-5 py-3 text-sm font-bold transition ${classes} ${className}`}
      {...props}
    />
  );
}
