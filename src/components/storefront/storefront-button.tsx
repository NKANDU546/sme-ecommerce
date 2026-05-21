import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

export type StorefrontButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "text";

type StorefrontButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<StorefrontButtonVariant, string> = {
  primary:
    "bg-[color:var(--sf-accent)] text-[color:var(--sf-cart-badge-fg)] shadow-sm transition-opacity hover:opacity-95",
  secondary:
    "border border-[color:var(--sf-accent-border-25)] bg-[color:var(--sf-nav-hover-wash)] text-[color:var(--sf-accent)] transition-colors hover:bg-[color:var(--sf-accent-border-15)]",
  outline:
    "border border-[color:var(--sf-accent-border-25)] bg-white text-[color:var(--sf-accent)] transition-colors hover:bg-[color:var(--sf-nav-hover-wash)]",
  text:
    "text-[color:var(--sf-accent)] underline decoration-[color:var(--sf-accent-border-25)] underline-offset-4 transition-colors hover:decoration-[color:var(--sf-accent)]",
};

const sizeClasses: Record<StorefrontButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-sm",
};

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function storefrontButtonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: StorefrontButtonVariant;
  size?: StorefrontButtonSize;
  className?: string;
} = {}): string {
  return cx(
    "inline-flex items-center justify-center rounded-md font-sans font-semibold disabled:cursor-not-allowed disabled:opacity-45",
    variantClasses[variant],
    variant === "text" ? "p-0" : sizeClasses[size],
    className,
  );
}

type StorefrontButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: StorefrontButtonVariant;
  size?: StorefrontButtonSize;
};

export function StorefrontButton({
  variant,
  size,
  className,
  ...props
}: StorefrontButtonProps) {
  return (
    <button
      className={storefrontButtonClassName({ variant, size, className })}
      {...props}
    />
  );
}

type StorefrontButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: StorefrontButtonVariant;
  size?: StorefrontButtonSize;
};

export function StorefrontButtonLink({
  variant,
  size,
  className,
  ...props
}: StorefrontButtonLinkProps) {
  return (
    <Link
      className={storefrontButtonClassName({ variant, size, className })}
      {...props}
    />
  );
}
