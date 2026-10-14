import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type CtaProps = {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
};

const externalProps = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Pill with the arrow nested in its own circle (button-in-button). */
export function PrimaryCta({ href, children, className, external = false }: CtaProps) {
  const Arrow = external ? ArrowUpRightIcon : ArrowRightIcon;
  const Anchor = external ? "a" : Link;
  return (
    <Anchor
      href={href}
      {...(external ? externalProps : {})}
      className={cn(
        "group inline-flex h-13 items-center gap-3 rounded-full bg-primary pr-1.5 pl-6 text-base font-medium whitespace-nowrap text-primary-foreground shadow-card select-none",
        "[transition:background-color_200ms_var(--ease-out),scale_150ms_var(--ease-out)] hover:bg-primary/90 active:scale-[0.97]",
        focusRing,
        className,
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/15 transition-[translate] duration-200 ease-out group-hover:translate-x-0.5"
      >
        <Arrow className="size-4" weight="bold" />
      </span>
    </Anchor>
  );
}

/** Tertiary text link, so the primary pill is the only filled control. */
export function TextCta({ href, children, className }: Omit<CtaProps, "external">) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-13 items-center gap-1.5 rounded-full px-3 text-base font-medium whitespace-nowrap underline decoration-foreground/25 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-thread",
        focusRing,
        className,
      )}
    >
      {children}
      <ArrowRightIcon aria-hidden="true" className="size-4 transition-[translate] duration-200 ease-out group-hover:translate-x-0.5" />
    </Link>
  );
}
